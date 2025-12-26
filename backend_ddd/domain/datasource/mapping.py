"""
Mapping实体
Mapping连接Datasource、Model和Property，是Datasource聚合的一部分
"""
from typing import Optional
from datetime import date


class Mapping:
    """
    Mapping实体
    
    Mapping定义了数据源字段到模型属性的映射关系
    
    业务规则：
    - Mapping必须属于某个Datasource
    - Mapping必须关联到Model和Property
    """
    
    def __init__(
        self,
        id: int,
        datasourceId: int,
        modelId: int,
        fieldId: str,
        propertyId: int,
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None
    ):
        self.id = id
        self.datasourceId = datasourceId  # 所属的Datasource（聚合根）
        self.modelId = modelId  # 关联的Model
        self.fieldId = fieldId  # 数据源字段名
        self.propertyId = propertyId  # 关联的Property
        self.createdAt = createdAt or date.today().isoformat()
        self.updatedAt = updatedAt or date.today().isoformat()
    
    def is_valid(self) -> tuple[bool, Optional[str]]:
        """
        验证映射的有效性
        
        业务规则：
        - fieldId不能为空
        - 必须关联到有效的Property
        """
        if not self.fieldId:
            return False, "FieldId cannot be empty"
        
        if not self.propertyId:
            return False, "PropertyId cannot be empty"
        
        return True, None
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "datasourceId": self.datasourceId,
            "modelId": self.modelId,
            "fieldId": self.fieldId,
            "propertyId": self.propertyId,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'Mapping':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            datasourceId=data["datasourceId"],
            modelId=data["modelId"],
            fieldId=data["fieldId"],
            propertyId=data["propertyId"],
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt")
        )
    
    def __repr__(self):
        return f"Mapping(id={self.id}, datasourceId={self.datasourceId}, modelId={self.modelId}, propertyId={self.propertyId})"

