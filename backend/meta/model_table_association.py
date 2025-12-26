"""
模型表关联实体
ModelTableAssociation连接Model和Datasource的表
"""
from typing import Optional
from datetime import date


class ModelTableAssociation:
    """模型表关联实体 - 连接Model和Datasource"""
    
    def __init__(
        self,
        id: int,
        modelId: int,
        datasourceId: int,
        tableName: str,
        status: str = "active",
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None
    ):
        self.id = id
        self.modelId = modelId
        self.datasourceId = datasourceId
        self.tableName = tableName
        self.status = status  # active, inactive
        self.createdAt = createdAt or date.today().isoformat()
        self.updatedAt = updatedAt or date.today().isoformat()
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "modelId": self.modelId,
            "datasourceId": self.datasourceId,
            "tableName": self.tableName,
            "status": self.status,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'ModelTableAssociation':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            modelId=data["modelId"],
            datasourceId=data["datasourceId"],
            tableName=data["tableName"],
            status=data.get("status", "active"),
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt")
        )
    
    def activate(self) -> 'ModelTableAssociation':
        """激活关联"""
        self.status = "active"
        self.updatedAt = date.today().isoformat()
        return self
    
    def deactivate(self) -> 'ModelTableAssociation':
        """停用关联"""
        self.status = "inactive"
        self.updatedAt = date.today().isoformat()
        return self
    
    def __repr__(self):
        return f"ModelTableAssociation(id={self.id}, modelId={self.modelId}, datasourceId={self.datasourceId}, tableName='{self.tableName}')"
