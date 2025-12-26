"""
ETLLog Repository
"""
from repository.base_repository import BaseRepository
from meta.etl_log import ETLLog


class ETLLogRepository(BaseRepository):
    """ETLLog持久化层"""
    
    def __init__(self):
        super().__init__("etl_logs", ETLLog)
    
    def _entity_from_row(self, row: tuple) -> ETLLog:
        return ETLLog(
            id=row[0],
            taskId=row[1],
            status=row[2],
            startTime=row[3],
            endTime=row[4],
            recordsProcessed=row[5] or 0,
            recordsSuccess=row[6] or 0,
            recordsFailed=row[7] or 0,
            errorMessage=row[8],
            details=row[9]
        )
    
    def _insert(self, conn, entity: ETLLog):
        conn.execute(
            "INSERT INTO etl_logs (id, taskId, status, startTime, endTime, recordsProcessed, recordsSuccess, recordsFailed, errorMessage, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (entity.id, entity.taskId, entity.status, entity.startTime, entity.endTime, entity.recordsProcessed, entity.recordsSuccess, entity.recordsFailed, entity.errorMessage, entity.details)
        )
    
    def _update(self, conn, entity: ETLLog):
        conn.execute(
            "UPDATE etl_logs SET taskId = ?, status = ?, startTime = ?, endTime = ?, recordsProcessed = ?, recordsSuccess = ?, recordsFailed = ?, errorMessage = ?, details = ? WHERE id = ?",
            (entity.taskId, entity.status, entity.startTime, entity.endTime, entity.recordsProcessed, entity.recordsSuccess, entity.recordsFailed, entity.errorMessage, entity.details, entity.id)
        )
    
    def find_by_task(self, task_id: int):
        return self.find_all({"taskId": task_id})
