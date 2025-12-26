"""
Domain值对象/实体
Domain作为分类/组织维度，不是聚合根
"""
from typing import Optional
from datetime import date


class Domain:
    """
    Domain实体
    
    Domain作为分类/组织维度，用于组织Models和Datasources
    
    业务规则：
    - Domain可以独立存在
    - Domain是可选的分类标签
    """
    
    def __init__(
        self,
        id: int,
        name: str,
        description: Optional[str] = None,
        owner: Optional[str] = None,
        updatedAt: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.description = description
        self.owner = owner
        self.updatedAt = updatedAt or date.today().isoformat()
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "owner": self.owner,
            "updatedAt": self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Domain':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            name=data["name"],
            description=data.get("description"),
            owner=data.get("owner"),
            updatedAt=data.get("updatedAt")
        )
    
    def __repr__(self):
        return f"Domain(id={self.id}, name='{self.name}')"

