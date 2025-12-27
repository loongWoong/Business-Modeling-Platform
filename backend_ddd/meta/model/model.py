"""
Model聚合根
Model是业务模型的原型定义，包含Properties和Relations
"""
from typing import Optional, List
from datetime import date
from .property import Property
from ..shared import Relation


class Model:
    """
    Model聚合根
    
    Model定义了业务模型的原型（Schema），包含：
    - Properties：字段定义
    - Relations：与其他Model的关系
    
    业务规则：
    - Model必须有一个唯一的code
    - Model可以包含多个Properties
    - Model可以与其他Model建立Relations
    """
    
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
        
        # 聚合内的实体（通过仓储加载）
        self._properties: List[Property] = []
        self._relations: List[Relation] = []
    
    @property
    def properties(self) -> List[Property]:
        """获取所有属性"""
        return self._properties.copy()
    
    @property
    def relations(self) -> List[Relation]:
        """获取所有关系"""
        return self._relations.copy()
    
    def add_property(self, property: Property) -> None:
        """
        添加属性到模型
        
        业务规则：
        - Property必须属于此Model
        - Property的code在Model内必须唯一
        """
        if property.modelId != self.id:
            raise ValueError(f"Property must belong to Model {self.id}")
        
        # 检查code是否已存在
        if any(p.code == property.code for p in self._properties):
            raise ValueError(f"Property with code '{property.code}' already exists in Model {self.id}")
        
        self._properties.append(property)
        self.updatedAt = date.today().isoformat()
    
    def remove_property(self, property_id: int) -> None:
        """移除属性"""
        self._properties = [p for p in self._properties if p.id != property_id]
        self.updatedAt = date.today().isoformat()
    
    def get_property_by_code(self, code: str) -> Optional[Property]:
        """根据code获取属性"""
        return next((p for p in self._properties if p.code == code), None)
    
    def add_relation(self, relation: Relation) -> None:
        """
        添加关系到模型
        
        业务规则：
        - Relation的sourceModelId或targetModelId必须等于此Model的id
        """
        if relation.sourceModelId != self.id and relation.targetModelId != self.id:
            raise ValueError(f"Relation must involve Model {self.id}")
        
        self._relations.append(relation)
        self.updatedAt = date.today().isoformat()
    
    def remove_relation(self, relation_id: int) -> None:
        """移除关系"""
        self._relations = [r for r in self._relations if r.id != relation_id]
        self.updatedAt = date.today().isoformat()
    
    def get_outgoing_relations(self) -> List[Relation]:
        """获取出站关系（sourceModelId == self.id）"""
        return [r for r in self._relations if r.sourceModelId == self.id]
    
    def get_incoming_relations(self) -> List[Relation]:
        """获取入站关系（targetModelId == self.id）"""
        return [r for r in self._relations if r.targetModelId == self.id]
    
    def validate_code(self) -> tuple[bool, Optional[str]]:
        """
        验证code的有效性
        
        业务规则：
        - code不能为空
        - code必须符合命名规范（字母、数字、下划线）
        """
        if not self.code:
            return False, "Code cannot be empty"
        
        if not self.code.replace('_', '').isalnum():
            return False, "Code must contain only letters, numbers, and underscores"
        
        return True, None
    
    def to_dict(self) -> dict:
        """转换为字典（不包含聚合内的实体）"""
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

