"""
ETL日志实体
ETLLog属于ETLTask
"""
from typing import Optional
from datetime import date


class ETLLog:
    """ETL日志实体 - 属于ETLTask"""
    
    def __init__(
        self,
        id: int,
        taskId: int,
        status: str,
        startTime: Optional[str] = None,
        endTime: Optional[str] = None,
        recordsProcessed: int = 0,
        recordsSuccess: int = 0,
        recordsFailed: int = 0,
        errorMessage: Optional[str] = None,
        details: Optional[str] = None
    ):
        self.id = id
        self.taskId = taskId
        self.status = status  # running, success, failed
        self.startTime = startTime or date.today().isoformat()
        self.endTime = endTime
        self.recordsProcessed = recordsProcessed
        self.recordsSuccess = recordsSuccess
        self.recordsFailed = recordsFailed
        self.errorMessage = errorMessage
        self.details = details
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "taskId": self.taskId,
            "status": self.status,
            "startTime": self.startTime,
            "endTime": self.endTime,
            "recordsProcessed": self.recordsProcessed,
            "recordsSuccess": self.recordsSuccess,
            "recordsFailed": self.recordsFailed,
            "errorMessage": self.errorMessage,
            "details": self.details
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'ETLLog':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            taskId=data["taskId"],
            status=data["status"],
            startTime=data.get("startTime"),
            endTime=data.get("endTime"),
            recordsProcessed=data.get("recordsProcessed", 0),
            recordsSuccess=data.get("recordsSuccess", 0),
            recordsFailed=data.get("recordsFailed", 0),
            errorMessage=data.get("errorMessage"),
            details=data.get("details")
        )
    
    def complete(self, end_time: Optional[str] = None) -> 'ETLLog':
        """完成日志"""
        self.status = "success"
        self.endTime = end_time or date.today().isoformat()
        return self
    
    def fail(self, error_message: str, end_time: Optional[str] = None) -> 'ETLLog':
        """标记失败"""
        self.status = "failed"
        self.errorMessage = error_message
        self.endTime = end_time or date.today().isoformat()
        return self
    
    def __repr__(self):
        return f"ETLLog(id={self.id}, taskId={self.taskId}, status='{self.status}')"
