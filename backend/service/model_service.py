"""
Model Service
"""
from typing import Optional, List, Dict
from repository.model_repository import ModelRepository
from meta.model import Model
from utils import get_current_date


class ModelService:
    """Model业务逻辑层"""
    
    def __init__(self):
        self.repository = ModelRepository()
    
    def get_all(self, domain_id: Optional[int] = None) -> Dict:
        """获取所有模型，包含边信息"""
        if domain_id:
            models = self.repository.find_by_domain(domain_id)
        else:
            models = self.repository.find_all()
        
        model_ids = [m.id for m in models]
        edges = self.repository.find_edges(model_ids)
        
        return {
            "models": [m.to_dict() for m in models],
            "edges": edges
        }
    
    def get_by_id(self, id: int) -> Optional[Model]:
        """根据ID获取模型"""
        return self.repository.find_by_id(id)
    
    def create(self, data: dict) -> Model:
        """创建模型"""
        model = Model.from_dict({
            "id": 0,  # 临时ID，repository会自动生成
            "name": data["name"],
            "code": data["code"],
            "description": data.get("description"),
            "creator": data.get("creator", "当前用户"),
            "updatedAt": get_current_date(),
            "domainId": data.get("domainId")
        })
        return self.repository.create(model)
    
    def update(self, id: int, data: dict) -> Optional[Model]:
        """更新模型"""
        model = self.repository.find_by_id(id)
        if not model:
            return None
        
        model.name = data.get("name", model.name)
        model.code = data.get("code", model.code)
        model.description = data.get("description", model.description)
        model.updatedAt = get_current_date()
        
        return self.repository.update(model)
    
    def delete(self, id: int) -> bool:
        """删除模型及其关联数据"""
        return self.repository.delete_with_relations(id)
