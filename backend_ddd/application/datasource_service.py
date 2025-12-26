"""
Datasource应用服务
协调Datasource聚合的业务用例
"""
from typing import Optional, List, Dict
from infrastructure.repository.datasource_repository import DatasourceRepository
from domain.datasource import Datasource, Mapping, ModelTableAssociation
from infrastructure.persistence.db_connection import get_current_date


class DatasourceService:
    """Datasource应用服务"""
    
    def __init__(self):
        self.repository = DatasourceRepository()
    
    def get_all(self, domain_id: Optional[int] = None) -> List[Dict]:
        """获取所有Datasource"""
        filters = {"domainId": domain_id} if domain_id else None
        datasources = self.repository.find_all(filters)
        return [ds.to_dict() for ds in datasources]
    
    def get_by_id(self, id: int) -> Optional[Dict]:
        """根据ID获取Datasource（包含Mappings和Associations）"""
        datasource = self.repository.find_by_id(id)
        if not datasource:
            return None
        
        return {
            "datasource": datasource.to_dict(),
            "mappings": [m.to_dict() for m in datasource.mappings],
            "associations": [a.to_dict() for a in datasource.modelTableAssociations]
        }
    
    def create_datasource(self, data: dict) -> Dict:
        """创建Datasource"""
        datasource = Datasource.from_dict({
            "id": 0,
            "name": data["name"],
            "type": data["type"],
            "url": data["url"],
            "username": data.get("username"),
            "password": data.get("password"),
            "tableName": data.get("tableName"),
            "status": data.get("status", "inactive"),
            "description": data.get("description"),
            "modelId": data.get("modelId"),
            "domainId": data.get("domainId"),
            "createdAt": get_current_date(),
            "updatedAt": get_current_date()
        })
        
        datasource = self.repository.save(datasource)
        return datasource.to_dict()
    
    def update_datasource(self, id: int, data: dict) -> Optional[Dict]:
        """更新Datasource"""
        datasource = self.repository.find_by_id(id)
        if not datasource:
            return None
        
        datasource.name = data.get("name", datasource.name)
        datasource.type = data.get("type", datasource.type)
        datasource.url = data.get("url", datasource.url)
        datasource.username = data.get("username", datasource.username)
        datasource.password = data.get("password", datasource.password)
        datasource.tableName = data.get("tableName", datasource.tableName)
        datasource.description = data.get("description", datasource.description)
        datasource.updatedAt = get_current_date()
        
        datasource = self.repository.save(datasource)
        return datasource.to_dict()
    
    def toggle_status(self, id: int) -> Optional[Dict]:
        """切换Datasource状态"""
        datasource = self.repository.find_by_id(id)
        if not datasource:
            return None
        
        datasource.toggle_status()
        datasource = self.repository.save(datasource)
        return datasource.to_dict()
    
    def add_mapping(self, datasource_id: int, data: dict) -> Optional[Dict]:
        """添加Mapping到Datasource"""
        datasource = self.repository.find_by_id(datasource_id)
        if not datasource:
            return None
        
        mapping = Mapping.from_dict({
            "id": 0,
            "datasourceId": datasource_id,
            "modelId": data["modelId"],
            "fieldId": data["fieldId"],
            "propertyId": data["propertyId"],
            "createdAt": get_current_date(),
            "updatedAt": get_current_date()
        })
        
        datasource.add_mapping(mapping)
        datasource = self.repository.save(datasource)
        
        added_mapping = datasource.get_mapping_by_property(mapping.propertyId)
        return added_mapping.to_dict() if added_mapping else None
    
    def add_association(self, datasource_id: int, data: dict) -> Optional[Dict]:
        """添加ModelTableAssociation到Datasource"""
        datasource = self.repository.find_by_id(datasource_id)
        if not datasource:
            return None
        
        association = ModelTableAssociation.from_dict({
            "id": 0,
            "modelId": data["modelId"],
            "datasourceId": datasource_id,
            "tableName": data["tableName"],
            "status": data.get("status", "active"),
            "createdAt": get_current_date(),
            "updatedAt": get_current_date()
        })
        
        datasource.add_model_table_association(association)
        datasource = self.repository.save(datasource)
        
        added_assoc = datasource.get_association_by_model(association.modelId)
        return added_assoc.to_dict() if added_assoc else None
    
    def delete_datasource(self, id: int) -> bool:
        """删除Datasource"""
        return self.repository.delete(id)

