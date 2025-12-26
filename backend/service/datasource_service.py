"""
Datasource Service
"""
from typing import Optional, List
from repository.datasource_repository import DatasourceRepository
from meta.datasource import Datasource
from utils import get_current_date, test_database_connection


class DatasourceService:
    """Datasource业务逻辑层"""
    
    def __init__(self):
        self.repository = DatasourceRepository()
    
    def get_all(self, model_id: Optional[int] = None, domain_id: Optional[int] = None) -> List[Datasource]:
        """获取所有数据源"""
        if model_id:
            return self.repository.find_by_model(model_id)
        elif domain_id:
            return self.repository.find_by_domain(domain_id)
        return self.repository.find_all()
    
    def get_by_id(self, id: int) -> Optional[Datasource]:
        """根据ID获取数据源"""
        return self.repository.find_by_id(id)
    
    def create(self, data: dict) -> Datasource:
        """创建数据源"""
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
        return self.repository.create(datasource)
    
    def update(self, id: int, data: dict) -> Optional[Datasource]:
        """更新数据源"""
        datasource = self.repository.find_by_id(id)
        if not datasource:
            return None
        
        if "name" in data:
            datasource.name = data["name"]
        if "type" in data:
            datasource.type = data["type"]
        if "url" in data:
            datasource.url = data["url"]
        if "username" in data:
            datasource.username = data["username"]
        if "password" in data:
            datasource.password = data["password"]
        if "tableName" in data:
            datasource.tableName = data["tableName"]
        if "status" in data:
            datasource.status = data["status"]
        if "description" in data:
            datasource.description = data["description"]
        if "modelId" in data:
            datasource.modelId = data["modelId"]
        if "domainId" in data:
            datasource.domainId = data["domainId"]
        
        datasource.updatedAt = get_current_date()
        return self.repository.update(datasource)
    
    def toggle_status(self, id: int) -> Optional[Datasource]:
        """切换数据源状态"""
        return self.repository.toggle_status(id)
    
    def test_connection(self, id: int) -> dict:
        """测试数据源连接"""
        datasource = self.repository.find_by_id(id)
        if not datasource:
            return {"success": False, "message": "数据源不存在"}
        
        success, message = test_database_connection(
            datasource.type,
            datasource.url,
            datasource.username,
            datasource.password
        )
        return {"success": success, "message": message}
    
    def delete(self, id: int) -> bool:
        """删除数据源"""
        return self.repository.delete(id)
