"""
Relation Service
"""
from typing import Optional, List
from repository.relation_repository import RelationRepository
from meta.relation import Relation


class RelationService:
    """Relation业务逻辑层"""
    
    def __init__(self):
        self.repository = RelationRepository()
    
    def get_all(self, model_id: Optional[int] = None, domain_id: Optional[int] = None) -> List[Relation]:
        """获取所有关系"""
        if model_id:
            return self.repository.find_by_model(model_id)
        elif domain_id:
            return self.repository.find_by_domain(domain_id)
        return self.repository.find_all()
    
    def get_by_id(self, id: int) -> Optional[Relation]:
        """根据ID获取关系"""
        return self.repository.find_by_id(id)
    
    def create(self, data: dict) -> Relation:
        """创建关系"""
        # 支持通过模型名称或ID创建
        source_model_id = data.get("sourceModelId")
        target_model_id = data.get("targetModelId")
        
        if not source_model_id or not target_model_id:
            raise ValueError("sourceModelId and targetModelId are required")
        
        relation = Relation.from_dict({
            "id": 0,
            "name": data["name"],
            "sourceModelId": source_model_id,
            "targetModelId": target_model_id,
            "type": data.get("type", "one-to-many"),
            "description": data.get("description"),
            "enabled": data.get("enabled", True)
        })
        return self.repository.create(relation)
    
    def update(self, id: int, data: dict) -> Optional[Relation]:
        """更新关系"""
        relation = self.repository.find_by_id(id)
        if not relation:
            return None
        
        if "name" in data:
            relation.name = data["name"]
        if "targetModelId" in data:
            relation.targetModelId = data["targetModelId"]
        if "type" in data:
            relation.type = data["type"]
        if "description" in data:
            relation.description = data["description"]
        if "enabled" in data:
            relation.enabled = data["enabled"]
        
        return self.repository.update(relation)
    
    def toggle(self, id: int) -> Optional[Relation]:
        """切换关系启用状态"""
        return self.repository.toggle(id)
    
    def delete(self, id: int) -> bool:
        """删除关系及其边"""
        return self.repository.delete_with_edge(id)
