"""
ETL应用服务
协调ETLTask聚合的业务用例
"""
from typing import Optional, List, Dict
from infrastructure.repository.etl_repository import ETLRepository
from meta.etl import ETLTask, ETLLog
from infrastructure.persistence.db_connection import get_current_date


class ETLService:
    """ETL应用服务"""
    
    def __init__(self):
        self.repository = ETLRepository()
    
    def get_all(self) -> List[Dict]:
        """获取所有ETLTask"""
        tasks = self.repository.find_all()
        return [task.to_dict() for task in tasks]
    
    def get_by_id(self, id: int) -> Optional[Dict]:
        """根据ID获取ETLTask（包含Logs）"""
        task = self.repository.find_by_id(id)
        if not task:
            return None
        
        return {
            "task": task.to_dict(),
            "logs": [log.to_dict() for log in task.logs]
        }
    
    def create_task(self, data: dict) -> Dict:
        """创建ETLTask"""
        task = ETLTask.from_dict({
            "id": 0,
            "name": data["name"],
            "sourceDatasourceId": data["sourceDatasourceId"],
            "targetModelId": data["targetModelId"],
            "description": data.get("description"),
            "status": data.get("status", "inactive"),
            "schedule": data.get("schedule"),
            "config": data.get("config"),
            "createdAt": get_current_date(),
            "updatedAt": get_current_date()
        })
        
        task = self.repository.save(task)
        return task.to_dict()
    
    def activate_task(self, id: int) -> Optional[Dict]:
        """激活ETLTask"""
        task = self.repository.find_by_id(id)
        if not task:
            return None
        
        task.activate()
        task = self.repository.save(task)
        return task.to_dict()
    
    def pause_task(self, id: int) -> Optional[Dict]:
        """暂停ETLTask"""
        task = self.repository.find_by_id(id)
        if not task:
            return None
        
        task.pause()
        task = self.repository.save(task)
        return task.to_dict()
    
    def start_task(self, id: int) -> Optional[Dict]:
        """启动ETLTask执行"""
        task = self.repository.find_by_id(id)
        if not task:
            return None
        
        task.start()
        task = self.repository.save(task)
        return task.to_dict()
    
    def complete_task(self, id: int) -> Optional[Dict]:
        """完成ETLTask执行"""
        task = self.repository.find_by_id(id)
        if not task:
            return None
        
        task.complete()
        task = self.repository.save(task)
        return task.to_dict()
    
    def add_log(self, task_id: int, data: dict) -> Optional[Dict]:
        """添加ETLLog到ETLTask"""
        task = self.repository.find_by_id(task_id)
        if not task:
            return None
        
        log = ETLLog.from_dict({
            "id": 0,
            "taskId": task_id,
            "status": data.get("status", "running"),
            "startTime": data.get("startTime", get_current_date()),
            "endTime": data.get("endTime"),
            "recordsProcessed": data.get("recordsProcessed", 0),
            "recordsSuccess": data.get("recordsSuccess", 0),
            "recordsFailed": data.get("recordsFailed", 0),
            "errorMessage": data.get("errorMessage"),
            "details": data.get("details")
        })
        
        task.add_log(log)
        task = self.repository.save(task)
        
        latest_log = task.get_latest_log()
        return latest_log.to_dict() if latest_log else None
