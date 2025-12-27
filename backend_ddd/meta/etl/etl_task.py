"""
ETLTask聚合根
ETLTask定义了ETL任务，连接Datasource和Model，包含ETLLogs
"""
from typing import Optional, List, Any
from datetime import date
import json
from .etl_log import ETLLog


class ETLTask:
    """
    ETLTask聚合根
    
    ETLTask定义了从Datasource到Model的数据抽取同步任务，包含：
    - ETLLogs：执行日志
    
    业务规则：
    - ETLTask必须关联到Datasource和Model
    - ETLTask有状态管理（inactive, active, running, paused, error）
    - ETLTask可以调度执行
    """
    
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
        self.sourceDatasourceId = sourceDatasourceId  # 源数据源
        self.targetModelId = targetModelId  # 目标模型
        self.description = description
        self.status = status  # inactive, active, running, paused, error
        self.schedule = schedule
        self.config = config
        self.createdAt = createdAt or date.today().isoformat()
        self.updatedAt = updatedAt or date.today().isoformat()
        self.lastRun = lastRun
        self.nextRun = nextRun
        
        # 聚合内的实体（通过仓储加载）
        self._logs: List[ETLLog] = []
    
    @property
    def logs(self) -> List[ETLLog]:
        """获取所有执行日志"""
        return self._logs.copy()
    
    def add_log(self, log: ETLLog) -> None:
        """
        添加执行日志
        
        业务规则：
        - Log必须属于此ETLTask
        """
        if log.taskId != self.id:
            raise ValueError(f"ETLLog must belong to ETLTask {self.id}")
        
        self._logs.append(log)
        self.updatedAt = date.today().isoformat()
    
    def get_latest_log(self) -> Optional[ETLLog]:
        """获取最新的执行日志"""
        if not self._logs:
            return None
        return max(self._logs, key=lambda log: log.startTime or "")
    
    def activate(self) -> 'ETLTask':
        """
        激活任务
        
        业务规则：
        - 只有inactive或paused状态的任务可以激活
        """
        if self.status not in ["inactive", "paused"]:
            raise ValueError(f"Cannot activate task in status '{self.status}'")
        
        self.status = "active"
        self.updatedAt = date.today().isoformat()
        return self
    
    def pause(self) -> 'ETLTask':
        """
        暂停任务
        
        业务规则：
        - 只有active状态的任务可以暂停
        """
        if self.status != "active":
            raise ValueError(f"Cannot pause task in status '{self.status}'")
        
        self.status = "paused"
        self.updatedAt = date.today().isoformat()
        return self
    
    def start(self) -> 'ETLTask':
        """
        启动任务执行
        
        业务规则：
        - 只有active状态的任务可以启动
        """
        if self.status != "active":
            raise ValueError(f"Cannot start task in status '{self.status}'")
        
        self.status = "running"
        self.updatedAt = date.today().isoformat()
        return self
    
    def complete(self, last_run: Optional[str] = None) -> 'ETLTask':
        """
        完成任务执行
        
        业务规则：
        - 只有running状态的任务可以完成
        """
        if self.status != "running":
            raise ValueError(f"Cannot complete task in status '{self.status}'")
        
        self.status = "active"
        self.lastRun = last_run or date.today().isoformat()
        self.updatedAt = date.today().isoformat()
        return self
    
    def error(self) -> 'ETLTask':
        """
        标记任务错误
        
        业务规则：
        - running状态的任务可以标记为error
        """
        if self.status != "running":
            raise ValueError(f"Cannot mark error for task in status '{self.status}'")
        
        self.status = "error"
        self.updatedAt = date.today().isoformat()
        return self
    
    def is_valid(self) -> tuple[bool, Optional[str]]:
        """
        验证任务的有效性
        
        业务规则：
        - 必须关联到有效的Datasource和Model
        - name不能为空
        """
        if not self.name:
            return False, "Name cannot be empty"
        
        if not self.sourceDatasourceId:
            return False, "SourceDatasourceId cannot be empty"
        
        if not self.targetModelId:
            return False, "TargetModelId cannot be empty"
        
        valid_statuses = ["inactive", "active", "running", "paused", "error"]
        if self.status not in valid_statuses:
            return False, f"Status must be one of {valid_statuses}"
        
        return True, None
    
    def to_dict(self) -> dict:
        """转换为字典（不包含聚合内的实体）"""
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
    
    def __repr__(self):
        return f"ETLTask(id={self.id}, name='{self.name}', status='{self.status}')"

