"""
ETLLog实体
ETLLog属于ETLTask，是ETL聚合的一部分
"""
from typing import Optional
from datetime import date


class ETLLog:
    """
    ETLLog实体
    
    ETLLog记录了ETL任务的执行日志，包括：
    - 执行状态、时间
    - 处理记录数、成功数、失败数
    - 错误信息
    
    业务规则：
    - ETLLog必须属于某个ETLTask
    - ETLLog有状态管理（running, success, failed）
    """
    
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
        self.taskId = taskId  # 所属的ETLTask（聚合根）
        self.status = status  # running, success, failed
        self.startTime = startTime or date.today().isoformat()
        self.endTime = endTime
        self.recordsProcessed = recordsProcessed
        self.recordsSuccess = recordsSuccess
        self.recordsFailed = recordsFailed
        self.errorMessage = errorMessage
        self.details = details
    
    def complete(self, end_time: Optional[str] = None) -> 'ETLLog':
        """
        完成日志
        
        业务规则：
        - 只有running状态的日志可以完成
        """
        if self.status != "running":
            raise ValueError(f"Cannot complete log in status '{self.status}'")
        
        self.status = "success"
        self.endTime = end_time or date.today().isoformat()
        return self
    
    def fail(self, error_message: str, end_time: Optional[str] = None) -> 'ETLLog':
        """
        标记失败
        
        业务规则：
        - 只有running状态的日志可以标记为失败
        """
        if self.status != "running":
            raise ValueError(f"Cannot fail log in status '{self.status}'")
        
        self.status = "failed"
        self.errorMessage = error_message
        self.endTime = end_time or date.today().isoformat()
        return self
    
    def is_valid(self) -> tuple[bool, Optional[str]]:
        """
        验证日志的有效性
        
        业务规则：
        - 必须关联到有效的ETLTask
        - 状态必须是有效的
        """
        if not self.taskId:
            return False, "TaskId cannot be empty"
        
        valid_statuses = ["running", "success", "failed"]
        if self.status not in valid_statuses:
            return False, f"Status must be one of {valid_statuses}"
        
        return True, None
    
    def get_success_rate(self) -> float:
        """获取成功率"""
        if self.recordsProcessed == 0:
            return 0.0
        return self.recordsSuccess / self.recordsProcessed
    
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
    
    def __repr__(self):
        return f"ETLLog(id={self.id}, taskId={self.taskId}, status='{self.status}')"

