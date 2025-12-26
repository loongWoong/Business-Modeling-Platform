"""
字段映射实体
Mapping连接Datasource、Model和Property
"""
from typing import Optional
from datetime import date


class Mapping:
    """字段映射实体 - 连接Datasource、Model、Property"""
    
    def __init__(
        self,
        id: int,
        datasourceId: int,
        modelId: int,
        fieldId: str,
        propertyId: int,
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None
    ):
        self.id = id
        self.datasourceId = datasourceId
        self.modelId = modelId
        self.fieldId = fieldId
        self.propertyId = propertyId
        self.createdAt = createdAt or date.today().isoformat()
        self.updatedAt = updatedAt or date.today().isoformat()
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "datasourceId": self.datasourceId,
            "modelId": self.modelId,
            "fieldId": self.fieldId,
            "propertyId": self.propertyId,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Mapping':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            datasourceId=data["datasourceId"],
            modelId=data["modelId"],
            fieldId=data["fieldId"],
            propertyId=data["propertyId"],
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt")
        )
    
    def __repr__(self):
        return f"Mapping(id={self.id}, datasourceId={self.datasourceId}, modelId={self.modelId}, propertyId={self.propertyId})"
