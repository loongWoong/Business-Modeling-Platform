"""
模型实体
Model是核心业务实体，可以独立存在
"""
from typing import Optional
from datetime import date


class Model:
    """模型实体 - 核心业务实体"""
    
    def __init__(
        self,
        id: int,
        name: str,
        code: str,
        description: Optional[str] = None,
        creator: Optional[str] = None,
        updatedAt: Optional[str] = None,
        domainId: Optional[int] = None
    ):
        self.id = id
        self.name = name
        self.code = code
        self.description = description
        self.creator = creator
        self.updatedAt = updatedAt or date.today().isoformat()
        self.domainId = domainId  # 可选，用于分类
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "creator": self.creator,
            "updatedAt": self.updatedAt,
            "domainId": self.domainId
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Model':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            name=data["name"],
            code=data["code"],
            description=data.get("description"),
            creator=data.get("creator"),
            updatedAt=data.get("updatedAt"),
            domainId=data.get("domainId")
        )
    
    def __repr__(self):
        return f"Model(id={self.id}, name='{self.name}', code='{self.code}')"
