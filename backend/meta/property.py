"""
属性实体
Property必须属于某个Model
"""
from typing import Optional, List, Any
import json


class Property:
    """属性实体 - 必须属于Model"""
    
    def __init__(
        self,
        id: int,
        name: str,
        code: str,
        type: str,
        modelId: int,
        required: bool = False,
        description: Optional[str] = None,
        isPrimaryKey: bool = False,
        isForeignKey: bool = False,
        defaultValue: Optional[str] = None,
        constraints: Optional[List[Any]] = None,
        sensitivityLevel: Optional[str] = None,
        maskRule: Optional[str] = None,
        physicalColumn: Optional[str] = None,
        foreignKeyTable: Optional[str] = None,
        foreignKeyColumn: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.code = code
        self.type = type
        self.modelId = modelId
        self.required = required
        self.description = description
        self.isPrimaryKey = isPrimaryKey
        self.isForeignKey = isForeignKey
        self.defaultValue = defaultValue
        self.constraints = constraints or []
        self.sensitivityLevel = sensitivityLevel
        self.maskRule = maskRule
        self.physicalColumn = physicalColumn
        self.foreignKeyTable = foreignKeyTable
        self.foreignKeyColumn = foreignKeyColumn
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "name": self.name,
            "code": self.code,
            "type": self.type,
            "required": self.required,
            "description": self.description,
            "modelId": self.modelId,
            "isPrimaryKey": self.isPrimaryKey,
            "isForeignKey": self.isForeignKey,
            "defaultValue": self.defaultValue,
            "constraints": self.constraints,
            "sensitivityLevel": self.sensitivityLevel,
            "maskRule": self.maskRule,
            "physicalColumn": self.physicalColumn,
            "foreignKeyTable": self.foreignKeyTable,
            "foreignKeyColumn": self.foreignKeyColumn
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Property':
        """从字典创建实例"""
        constraints = data.get("constraints", [])
        if isinstance(constraints, str):
            try:
                constraints = json.loads(constraints)
            except json.JSONDecodeError:
                constraints = []
        
        return cls(
            id=data["id"],
            name=data["name"],
            code=data["code"],
            type=data["type"],
            modelId=data["modelId"],
            required=data.get("required", False),
            description=data.get("description"),
            isPrimaryKey=data.get("isPrimaryKey", False),
            isForeignKey=data.get("isForeignKey", False),
            defaultValue=data.get("defaultValue"),
            constraints=constraints,
            sensitivityLevel=data.get("sensitivityLevel"),
            maskRule=data.get("maskRule"),
            physicalColumn=data.get("physicalColumn"),
            foreignKeyTable=data.get("foreignKeyTable"),
            foreignKeyColumn=data.get("foreignKeyColumn")
        )
    
    def __repr__(self):
        return f"Property(id={self.id}, name='{self.name}', modelId={self.modelId})"
