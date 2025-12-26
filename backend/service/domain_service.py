"""
Domain Service
"""
from typing import Optional, Dict
from repository.domain_repository import DomainRepository
from meta.domain import Domain
from utils import get_current_date


class DomainService:
    """Domain业务逻辑层"""
    
    def __init__(self):
        self.repository = DomainRepository()
    
    def get_all(self) -> Dict:
        """获取所有域，包含边信息"""
        domains = self.repository.find_all()
        edges = self.repository.find_edges()
        
        return {
            "domains": [d.to_dict() for d in domains],
            "edges": edges
        }
    
    def get_by_id(self, id: int) -> Optional[Domain]:
        """根据ID获取域"""
        return self.repository.find_by_id(id)
    
    def create(self, data: dict) -> Domain:
        """创建域"""
        domain = Domain.from_dict({
            "id": 0,
            "name": data["name"],
            "description": data.get("description"),
            "owner": data.get("owner"),
            "updatedAt": get_current_date()
        })
        return self.repository.create(domain)
    
    def update(self, id: int, data: dict) -> Optional[Domain]:
        """更新域"""
        domain = self.repository.find_by_id(id)
        if not domain:
            return None
        
        domain.name = data.get("name", domain.name)
        domain.description = data.get("description", domain.description)
        domain.owner = data.get("owner", domain.owner)
        domain.updatedAt = get_current_date()
        
        return self.repository.update(domain)
    
    def delete(self, id: int) -> bool:
        """删除域及其边"""
        return self.repository.delete_with_edges(id)
