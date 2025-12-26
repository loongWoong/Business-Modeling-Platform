"""
数据源实体
Datasource可以独立存在，可关联Model和Domain（可选）
"""
from typing import Optional
from datetime import date


class Datasource:
    """数据源实体 - 可独立存在"""
    
    def __init__(
        self,
        id: int,
        name: str,
        type: str,
        url: str,
        domainId: Optional[int] = None,
        username: Optional[str] = None,
        password: Optional[str] = None,
        tableName: Optional[str] = None,
        status: str = "inactive",
        description: Optional[str] = None,
        modelId: Optional[int] = None,
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.type = type  # mysql, postgresql, sqlserver, duckdb
        self.url = url
        self.domainId = domainId  # 可选分类
        self.username = username
        self.password = password
        self.tableName = tableName
        self.status = status  # active, inactive
        self.description = description
        self.modelId = modelId  # 可选关联
        self.createdAt = createdAt or date.today().isoformat()
        self.updatedAt = updatedAt or date.today().isoformat()
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "url": self.url,
            "username": self.username,
            "password": self.password,
            "tableName": self.tableName,
            "status": self.status,
            "description": self.description,
            "modelId": self.modelId,
            "domainId": self.domainId,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Datasource':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            name=data["name"],
            type=data["type"],
            url=data["url"],
            domainId=data.get("domainId"),
            username=data.get("username"),
            password=data.get("password"),
            tableName=data.get("tableName"),
            status=data.get("status", "inactive"),
            description=data.get("description"),
            modelId=data.get("modelId"),
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt")
        )
    
    def toggle_status(self) -> 'Datasource':
        """切换状态"""
        self.status = "active" if self.status == "inactive" else "inactive"
        self.updatedAt = date.today().isoformat()
        return self
    
    def __repr__(self):
        return f"Datasource(id={self.id}, name='{self.name}', type='{self.type}', status='{self.status}')"
