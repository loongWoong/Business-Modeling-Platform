"""
共享属性实体
SharedAttribute是域级别的共享资源
"""
from typing import Optional


class SharedAttribute:
    """共享属性实体 - 域级别共享资源"""
    
    def __init__(
        self,
        id: int,
        name: str,
        type: str,
        domainId: int,
        length: Optional[str] = None,
        precision: Optional[str] = None,
        description: Optional[str] = None,
        valueRange: Optional[str] = None,
        referenceCount: int = 0
    ):
        self.id = id
        self.name = name
        self.type = type
        self.domainId = domainId
        self.length = length
        self.precision = precision
        self.description = description
        self.valueRange = valueRange
        self.referenceCount = referenceCount
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "length": self.length,
            "precision": self.precision,
            "description": self.description,
            "valueRange": self.valueRange,
            "domainId": self.domainId,
            "referenceCount": self.referenceCount
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'SharedAttribute':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            name=data["name"],
            type=data["type"],
            domainId=data["domainId"],
            length=data.get("length"),
            precision=data.get("precision"),
            description=data.get("description"),
            valueRange=data.get("valueRange"),
            referenceCount=data.get("referenceCount", 0)
        )
    
    def increment_reference(self) -> 'SharedAttribute':
        """增加引用计数"""
        self.referenceCount += 1
        return self
    
    def decrement_reference(self) -> 'SharedAttribute':
        """减少引用计数"""
        if self.referenceCount > 0:
            self.referenceCount -= 1
        return self
    
    def __repr__(self):
        return f"SharedAttribute(id={self.id}, name='{self.name}', domainId={self.domainId})"
