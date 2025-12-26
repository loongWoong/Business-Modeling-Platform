"""
函数实体
Function是域级别的可复用函数
"""
from typing import Optional, Any
from datetime import date
import json


class Function:
    """函数实体 - 域级别资源"""
    
    def __init__(
        self,
        id: int,
        name: str,
        domainId: int,
        code: Optional[str] = None,
        description: Optional[str] = None,
        inputSchema: Optional[Any] = None,
        returnType: Optional[str] = None,
        version: Optional[str] = None,
        metadata: Optional[Any] = None,
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.domainId = domainId
        self.code = code
        self.description = description
        self.inputSchema = inputSchema
        self.returnType = returnType
        self.version = version
        self.metadata = metadata
        self.createdAt = createdAt or date.today().isoformat()
        self.updatedAt = updatedAt or date.today().isoformat()
    
    def to_dict(self) -> dict:
        """转换为字典"""
        input_schema = self.inputSchema
        if isinstance(input_schema, str):
            try:
                input_schema = json.loads(input_schema)
            except json.JSONDecodeError:
                pass
        
        metadata = self.metadata
        if isinstance(metadata, str):
            try:
                metadata = json.loads(metadata)
            except json.JSONDecodeError:
                pass
        
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "description": self.description,
            "inputSchema": input_schema,
            "returnType": self.returnType,
            "version": self.version,
            "metadata": metadata,
            "domainId": self.domainId,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Function':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            name=data["name"],
            domainId=data["domainId"],
            code=data.get("code"),
            description=data.get("description"),
            inputSchema=data.get("inputSchema"),
            returnType=data.get("returnType"),
            version=data.get("version"),
            metadata=data.get("metadata"),
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt")
        )
    
    def __repr__(self):
        return f"Function(id={self.id}, name='{self.name}', domainId={self.domainId})"
