"""
Indicator Service
"""
from typing import Optional, List
from repository.indicator_repository import IndicatorRepository
from meta.indicator import Indicator
from utils import get_current_date


class IndicatorService:
    """Indicator业务逻辑层"""
    
    def __init__(self):
        self.repository = IndicatorRepository()
    
    def get_all(self, domain_id: Optional[int] = None) -> List[Indicator]:
        """获取所有指标"""
        if domain_id:
            return self.repository.find_by_domain(domain_id)
        return self.repository.find_all()
    
    def get_by_id(self, id: int) -> Optional[Indicator]:
        """根据ID获取指标"""
        return self.repository.find_by_id(id)
    
    def create(self, data: dict) -> Indicator:
        """创建指标"""
        indicator = Indicator.from_dict({
            "id": 0,
            "name": data["name"],
            "expression": data.get("expression", ""),
            "returnType": data.get("returnType", "number"),
            "domainId": data["domainId"],
            "unit": data.get("unit"),
            "description": data.get("description"),
            "status": data.get("status", "draft"),
            "createdAt": get_current_date(),
            "updatedAt": get_current_date()
        })
        return self.repository.create(indicator)
    
    def update(self, id: int, data: dict) -> Optional[Indicator]:
        """更新指标"""
        indicator = self.repository.find_by_id(id)
        if not indicator:
            return None
        
        if "name" in data:
            indicator.name = data["name"]
        if "expression" in data:
            indicator.expression = data["expression"]
        if "returnType" in data:
            indicator.returnType = data["returnType"]
        if "unit" in data:
            indicator.unit = data["unit"]
        if "description" in data:
            indicator.description = data["description"]
        if "status" in data:
            indicator.status = data["status"]
        
        indicator.updatedAt = get_current_date()
        return self.repository.update(indicator)
    
    def publish(self, id: int) -> Optional[Indicator]:
        """发布指标"""
        indicator = self.repository.find_by_id(id)
        if indicator:
            indicator.publish()
            return self.repository.update(indicator)
        return None
    
    def offline(self, id: int) -> Optional[Indicator]:
        """下线指标"""
        indicator = self.repository.find_by_id(id)
        if indicator:
            indicator.offline()
            return self.repository.update(indicator)
        return None
    
    def delete(self, id: int) -> bool:
        """删除指标"""
        return self.repository.delete(id)
