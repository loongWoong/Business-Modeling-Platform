"""
Domain应用服务
协调Domain的业务用例
"""
from typing import Optional, List, Dict
from infrastructure.repository.domain_repository import DomainRepository
from domain.shared import Domain
from infrastructure.persistence.db_connection import get_current_date


class DomainService:
    """Domain应用服务"""
    
    def __init__(self):
        self.repository = DomainRepository()
    
    def get_all(self) -> List[Dict]:
        """获取所有Domain"""
        domains = self.repository.find_all()
        return [d.to_dict() for d in domains]
    
    def get_by_id(self, id: int) -> Optional[Dict]:
        """根据ID获取Domain"""
        domain = self.repository.find_by_id(id)
        return domain.to_dict() if domain else None
    
    def create_domain(self, data: dict) -> Dict:
        """创建Domain"""
        domain = Domain.from_dict({
            "id": 0,
            "name": data["name"],
            "description": data.get("description"),
            "owner": data.get("owner"),
            "updatedAt": get_current_date()
        })
        
        domain = self.repository.save(domain)
        return domain.to_dict()
    
    def update_domain(self, id: int, data: dict) -> Optional[Dict]:
        """更新Domain"""
        domain = self.repository.find_by_id(id)
        if not domain:
            return None
        
        domain.name = data.get("name", domain.name)
        domain.description = data.get("description", domain.description)
        domain.owner = data.get("owner", domain.owner)
        domain.updatedAt = get_current_date()
        
        domain = self.repository.save(domain)
        return domain.to_dict()
    
    def delete_domain(self, id: int) -> bool:
        """删除Domain"""
        return self.repository.delete(id)

