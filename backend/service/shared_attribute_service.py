"""
SharedAttribute Service
"""
from typing import Optional, List
from repository.shared_attribute_repository import SharedAttributeRepository
from meta.shared_attribute import SharedAttribute


class SharedAttributeService:
    """SharedAttribute业务逻辑层"""
    
    def __init__(self):
        self.repository = SharedAttributeRepository()
    
    def get_all(self, domain_id: Optional[int] = None) -> List[SharedAttribute]:
        """获取所有共享属性"""
        if domain_id:
            return self.repository.find_by_domain(domain_id)
        return self.repository.find_all()
    
    def get_by_id(self, id: int) -> Optional[SharedAttribute]:
        """根据ID获取共享属性"""
        return self.repository.find_by_id(id)
    
    def create(self, data: dict) -> SharedAttribute:
        """创建共享属性"""
        attr = SharedAttribute.from_dict({
            "id": 0,
            "name": data["name"],
            "type": data["type"],
            "domainId": data["domainId"],
            "length": data.get("length"),
            "precision": data.get("precision"),
            "description": data.get("description"),
            "valueRange": data.get("valueRange"),
            "referenceCount": 0
        })
        return self.repository.create(attr)
    
    def update(self, id: int, data: dict) -> Optional[SharedAttribute]:
        """更新共享属性"""
        attr = self.repository.find_by_id(id)
        if not attr:
            return None
        
        if "name" in data:
            attr.name = data["name"]
        if "type" in data:
            attr.type = data["type"]
        if "length" in data:
            attr.length = data["length"]
        if "precision" in data:
            attr.precision = data["precision"]
        if "description" in data:
            attr.description = data["description"]
        if "valueRange" in data:
            attr.valueRange = data["valueRange"]
        
        return self.repository.update(attr)
    
    def delete(self, id: int) -> bool:
        """删除共享属性"""
        return self.repository.delete(id)
