"""
ETL聚合仓储
负责ETLTask聚合的持久化，包括ETLLogs
"""
from typing import Optional, List
from infrastructure.repository.base_repository import IRepository
from infrastructure.persistence.db_connection import get_db_connection, get_current_date
from meta.etl import ETLTask, ETLLog
import json


class ETLRepository(IRepository[ETLTask]):
    """ETL聚合仓储"""
    
    def find_by_id(self, id: int) -> Optional[ETLTask]:
        """根据ID查找ETLTask聚合"""
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT * FROM etl_tasks WHERE id = ?", (id,)).fetchone()
            if not row:
                return None
            
            task = self._task_from_row(row)
            logs = self._load_logs(conn, id)
            for log in logs:
                task._logs.append(log)
            
            return task
        finally:
            conn.close()
    
    def find_all(self, filters: Optional[dict] = None) -> List[ETLTask]:
        """查找所有ETLTask聚合"""
        conn = get_db_connection()
        try:
            query = "SELECT * FROM etl_tasks"
            params = []
            if filters:
                conditions = [f"{k} = ?" for k in filters.keys()]
                params = list(filters.values())
                query += " WHERE " + " AND ".join(conditions)
            
            rows = conn.execute(query, tuple(params)).fetchall()
            tasks = []
            for row in rows:
                task = self._task_from_row(row)
                task_id = row[0]
                logs = self._load_logs(conn, task_id)
                for log in logs:
                    task._logs.append(log)
                tasks.append(task)
            
            return tasks
        finally:
            conn.close()
    
    def save(self, aggregate: ETLTask) -> ETLTask:
        """保存ETLTask聚合"""
        conn = get_db_connection()
        try:
            is_valid, error = aggregate.is_valid()
            if not is_valid:
                raise ValueError(error)
            
            if aggregate.id and self._exists(conn, aggregate.id):
                self._update_task(conn, aggregate)
            else:
                aggregate = self._create_task(conn, aggregate)
            
            self._save_logs(conn, aggregate)
            conn.commit()
            return aggregate
        finally:
            conn.close()
    
    def delete(self, id: int) -> bool:
        """删除ETLTask聚合"""
        conn = get_db_connection()
        try:
            conn.execute("DELETE FROM etl_logs WHERE taskId = ?", (id,))
            result = conn.execute("DELETE FROM etl_tasks WHERE id = ?", (id,))
            conn.commit()
            return result.rowcount > 0
        finally:
            conn.close()
    
    def _exists(self, conn, id: int) -> bool:
        result = conn.execute("SELECT COUNT(*) FROM etl_tasks WHERE id = ?", (id,)).fetchone()
        return result[0] > 0
    
    def _create_task(self, conn, task: ETLTask) -> ETLTask:
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM etl_tasks").fetchone()[0]
        task.id = next_id
        config_json = json.dumps(task.config) if task.config else None
        conn.execute(
            """INSERT INTO etl_tasks 
            (id, name, sourceDatasourceId, targetModelId, description, status, schedule, 
             config, createdAt, updatedAt, lastRun, nextRun) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (task.id, task.name, task.sourceDatasourceId, task.targetModelId, task.description,
             task.status, task.schedule, config_json, task.createdAt or get_current_date(),
             task.updatedAt or get_current_date(), task.lastRun, task.nextRun)
        )
        return task
    
    def _update_task(self, conn, task: ETLTask) -> None:
        config_json = json.dumps(task.config) if task.config else None
        conn.execute(
            """UPDATE etl_tasks SET name = ?, description = ?, status = ?, schedule = ?,
            config = ?, updatedAt = ?, lastRun = ?, nextRun = ? WHERE id = ?""",
            (task.name, task.description, task.status, task.schedule, config_json,
             get_current_date(), task.lastRun, task.nextRun, task.id)
        )
    
    def _save_logs(self, conn, task: ETLTask) -> None:
        existing = {l.id: l for l in self._load_logs(conn, task.id)}
        current_ids = {l.id for l in task.logs}
        
        for lid in existing:
            if lid not in current_ids:
                conn.execute("DELETE FROM etl_logs WHERE id = ?", (lid,))
        
        for log in task.logs:
            if log.id and log.id in existing:
                self._update_log(conn, log)
            else:
                self._create_log(conn, log)
    
    def _create_log(self, conn, log: ETLLog) -> None:
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM etl_logs").fetchone()[0]
        log.id = next_id
        conn.execute(
            """INSERT INTO etl_logs 
            (id, taskId, status, startTime, endTime, recordsProcessed, recordsSuccess, 
             recordsFailed, errorMessage, details) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (log.id, log.taskId, log.status, log.startTime, log.endTime,
             log.recordsProcessed, log.recordsSuccess, log.recordsFailed,
             log.errorMessage, log.details)
        )
    
    def _update_log(self, conn, log: ETLLog) -> None:
        conn.execute(
            """UPDATE etl_logs SET status = ?, endTime = ?, recordsProcessed = ?,
            recordsSuccess = ?, recordsFailed = ?, errorMessage = ?, details = ? WHERE id = ?""",
            (log.status, log.endTime, log.recordsProcessed, log.recordsSuccess,
             log.recordsFailed, log.errorMessage, log.details, log.id)
        )
    
    def _load_logs(self, conn, task_id: int) -> List[ETLLog]:
        rows = conn.execute("SELECT * FROM etl_logs WHERE taskId = ?", (task_id,)).fetchall()
        return [self._log_from_row(row) for row in rows]
    
    def _task_from_row(self, row: tuple) -> ETLTask:
        config = None
        if row[7]:
            try:
                config = json.loads(row[7])
            except:
                pass
        
        return ETLTask(
            id=row[0], name=row[1], sourceDatasourceId=row[2], targetModelId=row[3],
            description=row[4], status=row[5], schedule=row[6], config=config,
            createdAt=row[8], updatedAt=row[9], lastRun=row[10], nextRun=row[11]
        )
    
    def _log_from_row(self, row: tuple) -> ETLLog:
        return ETLLog(
            id=row[0], taskId=row[1], status=row[2], startTime=row[3], endTime=row[4],
            recordsProcessed=row[5], recordsSuccess=row[6], recordsFailed=row[7],
            errorMessage=row[8], details=row[9]
        )
