"""
Datasource聚合根
Datasource定义了数据源，包含Mappings和ModelTableAssociations
"""
from typing import Optional, List
from datetime import date
from ..shared import Mapping
from .model_table_association import ModelTableAssociation


class Datasource:
    """
    Datasource聚合根
    
    Datasource定义了数据源，包含：
    - Mappings：字段映射（连接Datasource-Model-Property）
    - ModelTableAssociations：模型表关联（连接Model-Datasource）
    
    业务规则：
    - Datasource必须有一个唯一的name
    - Datasource可以关联多个Model
    - Datasource可以定义字段映射
    """
    
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
        
        # 聚合内的实体（通过仓储加载）
        self._mappings: List[Mapping] = []
        self._modelTableAssociations: List[ModelTableAssociation] = []
    
    @property
    def mappings(self) -> List[Mapping]:
        """获取所有字段映射"""
        return self._mappings.copy()
    
    @property
    def modelTableAssociations(self) -> List[ModelTableAssociation]:
        """获取所有模型表关联"""
        return self._modelTableAssociations.copy()
    
    def add_mapping(self, mapping: Mapping) -> None:
        """
        添加字段映射
        
        业务规则：
        - Mapping必须属于此Datasource
        """
        if mapping.datasourceId != self.id:
            raise ValueError(f"Mapping must belong to Datasource {self.id}")
        
        self._mappings.append(mapping)
        self.updatedAt = date.today().isoformat()
    
    def remove_mapping(self, mapping_id: int) -> None:
        """移除字段映射"""
        self._mappings = [m for m in self._mappings if m.id != mapping_id]
        self.updatedAt = date.today().isoformat()
    
    def get_mapping_by_property(self, property_id: int) -> Optional[Mapping]:
        """根据Property ID获取映射"""
        return next((m for m in self._mappings if m.propertyId == property_id), None)
    
    def add_model_table_association(self, association: ModelTableAssociation) -> None:
        """
        添加模型表关联
        
        业务规则：
        - ModelTableAssociation必须属于此Datasource
        """
        if association.datasourceId != self.id:
            raise ValueError(f"ModelTableAssociation must belong to Datasource {self.id}")
        
        self._modelTableAssociations.append(association)
        self.updatedAt = date.today().isoformat()
    
    def remove_model_table_association(self, association_id: int) -> None:
        """移除模型表关联"""
        self._modelTableAssociations = [a for a in self._modelTableAssociations if a.id != association_id]
        self.updatedAt = date.today().isoformat()
    
    def get_association_by_model(self, model_id: int) -> Optional[ModelTableAssociation]:
        """根据Model ID获取关联"""
        return next((a for a in self._modelTableAssociations if a.modelId == model_id), None)
    
    def toggle_status(self) -> 'Datasource':
        """
        切换状态
        
        业务规则：
        - 只能在active和inactive之间切换
        """
        self.status = "active" if self.status == "inactive" else "inactive"
        self.updatedAt = date.today().isoformat()
        return self
    
    def validate_connection(self) -> tuple[bool, Optional[str]]:
        """
        验证数据源连接配置
        
        业务规则：
        - URL不能为空
        - 类型必须是支持的数据库类型
        """
        if not self.url:
            return False, "URL cannot be empty"
        
        valid_types = ["mysql", "postgresql", "sqlserver", "duckdb"]
        if self.type.lower() not in valid_types:
            return False, f"Type must be one of {valid_types}"
        
        return True, None
    
    def to_dict(self) -> dict:
        """转换为字典（不包含聚合内的实体）"""
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
    
    def __repr__(self):
        return f"Datasource(id={self.id}, name='{self.name}', type='{self.type}', status='{self.status}')"

