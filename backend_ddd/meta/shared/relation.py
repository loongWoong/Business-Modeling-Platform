"""
Relation实体
Relation连接两个Model，是Model聚合的一部分
"""
from typing import Optional


class Relation:
    """
    Relation实体
    
    Relation定义了Model之间的关系，包括：
    - 关系类型（one-to-one, one-to-many, many-to-many）
    - 源Model和目标Model
    
    业务规则：
    - Relation必须连接两个不同的Model
    - Relation可以启用或禁用
    """
    
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
        if sourceModelId == targetModelId:
            raise ValueError("Source and target Model cannot be the same")
        
        self.id = id
        self.name = name
        self.sourceModelId = sourceModelId
        self.targetModelId = targetModelId
        self.type = type
        self.description = description
        self.enabled = enabled
    
    def toggle(self) -> 'Relation':
        """
        切换启用状态
        
        业务规则：
        - 可以启用或禁用关系
        """
        self.enabled = not self.enabled
        return self
    
    def is_valid(self) -> tuple[bool, Optional[str]]:
        """
        验证关系的有效性
        
        业务规则：
        - 源Model和目标Model不能相同
        - 关系类型必须是有效的
        """
        if self.sourceModelId == self.targetModelId:
            return False, "Source and target Model cannot be the same"
        
        valid_types = ["one-to-one", "one-to-many", "many-to-one", "many-to-many"]
        if self.type not in valid_types:
            return False, f"Relation type must be one of {valid_types}"
        
        return True, None
    
    def involves_model(self, model_id: int) -> bool:
        """检查关系是否涉及指定的Model"""
        return self.sourceModelId == model_id or self.targetModelId == model_id
    
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
    
    def __repr__(self):
        return f"Relation(id={self.id}, name='{self.name}', source={self.sourceModelId}, target={self.targetModelId})"

