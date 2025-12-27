"""
Model应用服务
协调Model聚合的业务用例
"""
from typing import Optional, List, Dict
from infrastructure.repository.model_repository import ModelRepository
from meta.model import Model, Property
from meta.shared import Relation
from infrastructure.persistence.db_connection import get_current_date


class ModelService:
    """Model应用服务"""
    
    def __init__(self):
        self.repository = ModelRepository()
    
    def get_all(self, domain_id: Optional[int] = None) -> Dict:
        """获取所有Model，包含边信息"""
        filters = {"domainId": domain_id} if domain_id else None
        models = self.repository.find_all(filters)
        
        edges = []
        for model in models:
            for relation in model.relations:
                if relation.sourceModelId == model.id:
                    edges.append({
                        "source": relation.sourceModelId,
                        "target": relation.targetModelId
                    })
        
        return {
            "models": [m.to_dict() for m in models],
            "edges": edges
        }
    
    def get_by_id(self, id: int) -> Optional[Dict]:
        """根据ID获取Model（包含Properties和Relations）"""
        model = self.repository.find_by_id(id)
        if not model:
            return None
        
        return {
            "model": model.to_dict(),
            "properties": [p.to_dict() for p in model.properties],
            "relations": [r.to_dict() for r in model.relations]
        }
    
    def create_model(self, data: dict) -> Dict:
        """创建Model"""
        model = Model.from_dict({
            "id": 0,
            "name": data["name"],
            "code": data["code"],
            "description": data.get("description"),
            "creator": data.get("creator", "当前用户"),
            "updatedAt": get_current_date(),
            "domainId": data.get("domainId")
        })
        
        model = self.repository.save(model)
        return model.to_dict()
    
    def update_model(self, id: int, data: dict) -> Optional[Dict]:
        """更新Model"""
        model = self.repository.find_by_id(id)
        if not model:
            return None
        
        model.name = data.get("name", model.name)
        model.code = data.get("code", model.code)
        model.description = data.get("description", model.description)
        model.updatedAt = get_current_date()
        
        model = self.repository.save(model)
        return model.to_dict()
    
    def delete_model(self, id: int) -> bool:
        """删除Model"""
        return self.repository.delete(id)
    
    def add_property(self, model_id: int, data: dict) -> Optional[Dict]:
        """添加Property到Model"""
        model = self.repository.find_by_id(model_id)
        if not model:
            return None
        
        property = Property.from_dict({
            "id": 0,
            "name": data["name"],
            "code": data["code"],
            "type": data["type"],
            "modelId": model_id,
            "required": data.get("required", False),
            "description": data.get("description"),
            "isPrimaryKey": data.get("isPrimaryKey", False),
            "isForeignKey": data.get("isForeignKey", False),
            "defaultValue": data.get("defaultValue"),
            "constraints": data.get("constraints", []),
            "sensitivityLevel": data.get("sensitivityLevel"),
            "maskRule": data.get("maskRule"),
            "physicalColumn": data.get("physicalColumn"),
            "foreignKeyTable": data.get("foreignKeyTable"),
            "foreignKeyColumn": data.get("foreignKeyColumn")
        })
        
        model.add_property(property)
        model = self.repository.save(model)
        
        added_prop = model.get_property_by_code(property.code)
        return added_prop.to_dict() if added_prop else None
    
    def remove_property(self, model_id: int, property_id: int) -> bool:
        """从Model移除Property"""
        model = self.repository.find_by_id(model_id)
        if not model:
            return False
        
        model.remove_property(property_id)
        self.repository.save(model)
        return True
    
    def add_relation(self, data: dict) -> Optional[Dict]:
        """添加Relation"""
        relation = Relation.from_dict({
            "id": 0,
            "name": data["name"],
            "sourceModelId": data["sourceModelId"],
            "targetModelId": data["targetModelId"],
            "type": data.get("type", "one-to-many"),
            "description": data.get("description"),
            "enabled": data.get("enabled", True)
        })
        
        source_model = self.repository.find_by_id(relation.sourceModelId)
        if not source_model:
            return None
        
        source_model.add_relation(relation)
        source_model = self.repository.save(source_model)
        
        added_rel = next((r for r in source_model.relations if r.id == relation.id), None)
        return added_rel.to_dict() if added_rel else None
    
    def remove_relation(self, relation_id: int) -> bool:
        """删除Relation"""
        models = self.repository.find_all()
        for model in models:
            if any(r.id == relation_id for r in model.relations):
                model.remove_relation(relation_id)
                self.repository.save(model)
                return True
        return False
