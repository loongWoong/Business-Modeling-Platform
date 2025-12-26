"""
数据记录实体
DataRecord是Model的实例，根据Model和Properties定义的原型创建
"""
from typing import Optional, Dict, Any
from datetime import date


class DataRecord:
    """
    数据记录实体 - Model的实例
    
    Model + Properties 定义了数据模型的原型（Schema）
    DataRecord 是根据这个原型创建的实际数据实例
    """
    
    def __init__(
        self,
        id: int,
        modelId: int,
        data: Dict[str, Any],
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None
    ):
        self.id = id
        self.modelId = modelId  # 所属的Model（原型）
        self.data = data  # 实际数据，键为Property的code，值为数据值
        self.createdAt = createdAt or date.today().isoformat()
        self.updatedAt = updatedAt or date.today().isoformat()
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "modelId": self.modelId,
            **self.data,  # 展开data字段，使属性直接作为顶层字段
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict, model_id: int) -> 'DataRecord':
        """从字典创建实例"""
        # 提取系统字段
        record_id = data.get("id", 0)
        created_at = data.get("createdAt")
        updated_at = data.get("updatedAt")
        
        # 剩余字段作为实际数据
        record_data = {k: v for k, v in data.items() 
                      if k not in ["id", "modelId", "createdAt", "updatedAt"]}
        
        return cls(
            id=record_id,
            modelId=model_id,
            data=record_data,
            createdAt=created_at,
            updatedAt=updated_at
        )
    
    def get_property_value(self, property_code: str) -> Any:
        """获取指定属性的值"""
        return self.data.get(property_code)
    
    def set_property_value(self, property_code: str, value: Any):
        """设置指定属性的值"""
        self.data[property_code] = value
        self.updatedAt = date.today().isoformat()
    
    def validate_against_properties(self, properties: list) -> tuple[bool, list]:
        """
        根据Properties验证数据
        
        Args:
            properties: Property实体列表
            
        Returns:
            (is_valid, errors): 是否有效和错误列表
        """
        errors = []
        
        for prop in properties:
            prop_code = prop.code
            value = self.data.get(prop_code)
            
            # 检查必填字段
            if prop.required and (value is None or value == ""):
                errors.append(f"属性 '{prop.name}' ({prop_code}) 是必填的")
            
            # 检查类型（简单验证）
            if value is not None and prop.type:
                type_valid = self._validate_type(value, prop.type)
                if not type_valid:
                    errors.append(f"属性 '{prop.name}' ({prop_code}) 类型不匹配，期望 {prop.type}")
        
        return len(errors) == 0, errors
    
    def _validate_type(self, value: Any, expected_type: str) -> bool:
        """简单的类型验证"""
        type_mapping = {
            "string": str,
            "number": (int, float),
            "integer": int,
            "boolean": bool,
            "date": str,
            "datetime": str
        }
        
        expected = type_mapping.get(expected_type.lower())
        if expected is None:
            return True  # 未知类型，不验证
        
        if isinstance(expected, tuple):
            return isinstance(value, expected)
        return isinstance(value, expected)
    
    def __repr__(self):
        return f"DataRecord(id={self.id}, modelId={self.modelId}, data={self.data})"
