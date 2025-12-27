"""
ModelTableAssociation实体
ModelTableAssociation连接Model和Datasource的表，是Datasource聚合的一部分
"""
from typing import Optional
from datetime import date


class ModelTableAssociation:
    """
    ModelTableAssociation实体
    
    ModelTableAssociation定义了Model与Datasource表的关联关系
    
    业务规则：
    - ModelTableAssociation必须属于某个Datasource
    - ModelTableAssociation必须关联到Model
    - tableName不能为空
    """
    
    def __init__(
        self,
        id: int,
        modelId: int,
        datasourceId: int,
        tableName: str,
        status: str = "active",
        createdAt: Optional[str] = None,
        updatedAt: Optional[str] = None
    ):
        self.id = id
        self.modelId = modelId  # 关联的Model
        self.datasourceId = datasourceId  # 所属的Datasource（聚合根）
        self.tableName = tableName
        self.status = status  # active, inactive
        self.createdAt = createdAt or date.today().isoformat()
        self.updatedAt = updatedAt or date.today().isoformat()
    
    def activate(self) -> 'ModelTableAssociation':
        """
        激活关联
        
        业务规则：
        - 可以激活或停用关联
        """
        self.status = "active"
        self.updatedAt = date.today().isoformat()
        return self
    
    def deactivate(self) -> 'ModelTableAssociation':
        """停用关联"""
        self.status = "inactive"
        self.updatedAt = date.today().isoformat()
        return self
    
    def is_valid(self) -> tuple[bool, Optional[str]]:
        """
        验证关联的有效性
        
        业务规则：
        - tableName不能为空
        - 必须关联到有效的Model
        """
        if not self.tableName:
            return False, "TableName cannot be empty"
        
        if not self.modelId:
            return False, "ModelId cannot be empty"
        
        return True, None
    
    def to_dict(self) -> dict:
        """转换为字典"""
        return {
            "id": self.id,
            "modelId": self.modelId,
            "datasourceId": self.datasourceId,
            "tableName": self.tableName,
            "status": self.status,
            "createdAt": self.createdAt,
            "updatedAt": self.updatedAt
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> 'ModelTableAssociation':
        """从字典创建实例"""
        return cls(
            id=data["id"],
            modelId=data["modelId"],
            datasourceId=data["datasourceId"],
            tableName=data["tableName"],
            status=data.get("status", "active"),
            createdAt=data.get("createdAt"),
            updatedAt=data.get("updatedAt")
        )
    
    def __repr__(self):
        return f"ModelTableAssociation(id={self.id}, modelId={self.modelId}, datasourceId={self.datasourceId}, tableName='{self.tableName}')"

