"""
ETL任务实体
ETLTask连接Datasource和Model，不依赖Domain
"""
from typing import Optional, Any
from datetime import date
import json


class ETLTask:
    """ETL任务实体 - 连接Datasource和Model"""
    
    def __init__(
        self,
        id: int,
        name: str,
        sourceDatasourceId: int,
        targetModelId: int,
        description: Optional[str] = None,
        status: str = "inactive",
        schedule: Optional[str] = None,
        config: Optional[Any] = None,
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None,
        lastRun: Optional[str] = None,
        nextRun: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.sourceDatasourceId = sourceDatasourceId
        self.targetModelId = targetModelId
        self.description = description
        self.status = status  # inactive, active, running, paused, error
        self.schedule = schedule
        self.config = config
        self.createdAt = createdAt or date.today().isoformat()
        self.updatedAt = updatedAt or date.today().isoformat()
        self.lastRun = lastRun
        self.nextRun = nextRun
    
    def to_dict(self) -> dict:
        """转换为字典"""
        config = self.config
        if isinstance(config, str):
            try:
                config = json.loads(config)
            except json.JSONDecodeError:
                pass
        
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "sourceDatasourceId": self.sourceDatasourceId,
            "targetModelId": self.targetModelId,
            "status": self.status,
            "schedule": self.schedule,
            "config": config,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt,
            "lastRun": self.lastRun,
            "nextRun": self.nextRun
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'ETLTask':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            name=data["name"],
            sourceDatasourceId=data["sourceDatasourceId"],
            targetModelId=data["targetModelId"],
            description=data.get("description"),
            status=data.get("status", "inactive"),
            schedule=data.get("schedule"),
            config=data.get("config"),
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt"),
            lastRun=data.get("lastRun"),
            nextRun=data.get("nextRun")
        )
    
    def activate(self) -> 'ETLTask':
        """激活任务"""
        self.status = "active"
        self.updatedAt = date.today().isoformat()
        return self
    
    def pause(self) -> 'ETLTask':
        """暂停任务"""
        self.status = "paused"
        self.updatedAt = date.today().isoformat()
        return self
    
    def start(self) -> 'ETLTask':
        """启动任务"""
        self.status = "running"
        self.updatedAt = date.today().isoformat()
        return self
    
    def complete(self, last_run: Optional[str] = None) -> 'ETLTask':
        """完成任务"""
        self.status = "active"
        self.lastRun = last_run or date.today().isoformat()
        self.updatedAt = date.today().isoformat()
        return self
    
    def error(self) -> 'ETLTask':
        """标记任务错误"""
        self.status = "error"
        self.updatedAt = date.today().isoformat()
        return self
    
    def __repr__(self):
        return f"ETLTask(id={self.id}, name='{self.name}', status='{self.status}')"
