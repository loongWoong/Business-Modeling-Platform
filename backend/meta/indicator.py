"""
语义指标实体
Indicator是域级别的语义指标
"""
from typing import Optional
from datetime import date


class Indicator:
    """语义指标实体 - 域级别资源"""
    
    def __init__(
        self,
        id: int,
        name: str,
        expression: str,
        returnType: str,
        domainId: int,
        unit: Optional[str] = None,
        description: Optional[str] = None,
        status: str = "draft",
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.expression = expression
        self.returnType = returnType
        self.domainId = domainId
        self.unit = unit
        self.description = description
        self.status = status  # draft, published, offline
        self.createdAt = createdAt or date.today().isoformat()
        self.updatedAt = updatedAt or date.today().isoformat()
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "expression": self.expression,
            "returnType": self.returnType,
            "unit": self.unit,
            "description": self.description,
            "status": self.status,
            "domainId": self.domainId,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Indicator':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            name=data["name"],
            expression=data.get("expression", ""),
            returnType=data.get("returnType", "number"),
            domainId=data["domainId"],
            unit=data.get("unit"),
            description=data.get("description"),
            status=data.get("status", "draft"),
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt")
        )
    
    def publish(self) -> 'Indicator':
        """发布指标"""
        self.status = "published"
        self.updatedAt = date.today().isoformat()
        return self
    
    def offline(self) -> 'Indicator':
        """下线指标"""
        self.status = "offline"
        self.updatedAt = date.today().isoformat()
        return self
    
    def __repr__(self):
        return f"Indicator(id={self.id}, name='{self.name}', status='{self.status}')"
