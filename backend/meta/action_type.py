"""
动作类型实体
ActionType关联到Model，不依赖Domain
"""
from typing import Optional, Any
from datetime import date
import json


class ActionType:
    """动作类型实体 - 关联Model"""
    
    def __init__(
        self,
        id: int,
        name: str,
        targetObjectTypeId: int,
        description: Optional[str] = None,
        inputSchema: Optional[Any] = None,
        outputSchema: Optional[Any] = None,
        requiresApproval: bool = False,
        handlerFunction: Optional[str] = None,
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.targetObjectTypeId = targetObjectTypeId  # 关联到Model
        self.description = description
        self.inputSchema = inputSchema
        self.outputSchema = outputSchema
        self.requiresApproval = requiresApproval
        self.handlerFunction = handlerFunction
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
        
        output_schema = self.outputSchema
        if isinstance(output_schema, str):
            try:
                output_schema = json.loads(output_schema)
            except json.JSONDecodeError:
                pass
        
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "targetObjectTypeId": self.targetObjectTypeId,
            "inputSchema": input_schema,
            "outputSchema": output_schema,
            "requiresApproval": self.requiresApproval,
            "handlerFunction": self.handlerFunction,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'ActionType':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            name=data["name"],
            targetObjectTypeId=data["targetObjectTypeId"],
            description=data.get("description"),
            inputSchema=data.get("inputSchema"),
            outputSchema=data.get("outputSchema"),
            requiresApproval=data.get("requiresApproval", False),
            handlerFunction=data.get("handlerFunction"),
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt")
        )
    
    def __repr__(self):
        return f"ActionType(id={self.id}, name='{self.name}', targetModelId={self.targetObjectTypeId})"
