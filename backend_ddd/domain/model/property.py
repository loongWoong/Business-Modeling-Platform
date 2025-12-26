"""
Property实体
Property必须属于某个Model，是Model聚合的一部分
"""
from typing import Optional, List, Any
import json


class Property:
    """
    Property实体
    
    Property定义了Model的字段定义，包含：
    - 数据类型、约束、验证规则
    - 敏感度、脱敏规则
    - 外键关系
    
    业务规则：
    - Property必须属于某个Model
    - Property的code在Model内必须唯一
    """
    
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
        self.modelId = modelId  # 所属的Model（聚合根）
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
    
    def validate_value(self, value: Any) -> tuple[bool, Optional[str]]:
        """
        验证值是否符合Property的定义
        
        业务规则：
        - 如果required=True，值不能为None
        - 值必须符合type定义
        - 值必须符合constraints约束
        """
        # 检查必填
        if self.required and value is None:
            return False, f"Property '{self.code}' is required"
        
        # 如果值为None且不是必填，则通过
        if value is None:
            return True, None
        
        # 类型检查
        type_check = self._check_type(value)
        if not type_check[0]:
            return type_check
        
        # 约束检查
        constraint_check = self._check_constraints(value)
        if not constraint_check[0]:
            return constraint_check
        
        return True, None
    
    def _check_type(self, value: Any) -> tuple[bool, Optional[str]]:
        """检查值类型"""
        type_mapping = {
            "string": str,
            "integer": int,
            "float": float,
            "boolean": bool,
            "date": str,  # 日期用字符串表示
            "datetime": str
        }
        
        expected_type = type_mapping.get(self.type.lower())
        if expected_type and not isinstance(value, expected_type):
            return False, f"Value must be of type {self.type}"
        
        return True, None
    
    def _check_constraints(self, value: Any) -> tuple[bool, Optional[str]]:
        """检查约束"""
        for constraint in self.constraints:
            constraint_type = constraint.get("type") if isinstance(constraint, dict) else None
            
            if constraint_type == "minLength" and isinstance(value, str):
                min_len = constraint.get("value", 0)
                if len(value) < min_len:
                    return False, f"Value length must be at least {min_len}"
            
            elif constraint_type == "maxLength" and isinstance(value, str):
                max_len = constraint.get("value", 0)
                if len(value) > max_len:
                    return False, f"Value length must be at most {max_len}"
            
            elif constraint_type == "min" and isinstance(value, (int, float)):
                min_val = constraint.get("value", 0)
                if value < min_val:
                    return False, f"Value must be at least {min_val}"
            
            elif constraint_type == "max" and isinstance(value, (int, float)):
                max_val = constraint.get("value", 0)
                if value > max_val:
                    return False, f"Value must be at most {max_val}"
        
        return True, None
    
    def mask_value(self, value: Any) -> Any:
        """
        根据maskRule对值进行脱敏
        
        业务规则：
        - 如果sensitivityLevel不为None，需要脱敏
        - 根据maskRule规则进行脱敏
        """
        if not self.sensitivityLevel or not self.maskRule or value is None:
            return value
        
        if self.maskRule == "phone":
            if isinstance(value, str) and len(value) >= 7:
                return value[:3] + "****" + value[-4:]
        
        elif self.maskRule == "email":
            if isinstance(value, str) and "@" in value:
                parts = value.split("@")
                if len(parts[0]) > 2:
                    return parts[0][:2] + "***@" + parts[1]
                return "***@" + parts[1]
        
        elif self.maskRule == "idCard":
            if isinstance(value, str) and len(value) >= 6:
                return value[:6] + "********" + value[-4:]
        
        return value
    
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

