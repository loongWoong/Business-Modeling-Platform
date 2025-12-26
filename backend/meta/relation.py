"""
关系实体
Relation连接两个Model，不依赖Domain
"""
from typing import Optional


class Relation:
    """关系实体 - 连接两个Model"""
    
    def __init__(
        self,
        id: int,
        name: str,
        sourceModelId: int,
        targetModelId: int,
        type: str = "one-to-many",
        description: Optional[str] = None,
        enabled: bool = True
    ):
        self.id = id
        self.name = name
        self.sourceModelId = sourceModelId
        self.targetModelId = targetModelId
        self.type = type
        self.description = description
        self.enabled = enabled
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "sourceModelId": self.sourceModelId,
            "targetModelId": self.targetModelId,
            "type": self.type,
            "description": self.description,
            "enabled": self.enabled
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Relation':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            name=data["name"],
            sourceModelId=data["sourceModelId"],
            targetModelId=data["targetModelId"],
            type=data.get("type", "one-to-many"),
            description=data.get("description"),
            enabled=data.get("enabled", True)
        )
    
    def toggle(self) -> 'Relation':
        """切换启用状态"""
        self.enabled = not self.enabled
        return self
    
    def __repr__(self):
        return f"Relation(id={self.id}, name='{self.name}', source={self.sourceModelId}, target={self.targetModelId})"
