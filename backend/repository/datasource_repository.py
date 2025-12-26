"""
Datasource Repository
"""
from repository.base_repository import BaseRepository
from meta.datasource import Datasource
from utils import get_current_date


class DatasourceRepository(BaseRepository):
    """Datasource持久化层"""
    
    def __init__(self):
        super().__init__("datasources", Datasource)
    
    def _entity_from_row(self, row: tuple) -> Datasource:
        return Datasource(
            id=row[0],
            name=row[1],
            type=row[2],
            url=row[3],
            username=row[4],
            password=row[5],
            tableName=row[6],
            status=row[7],
            description=row[8],
            modelId=row[9],
            domainId=row[10],
            createdAt=row[11],
            updatedAt=row[12]
        )
    
    def _insert(self, conn, entity: Datasource):
        conn.execute(
            "INSERT INTO datasources (id, name, type, url, username, password, tableName, status, description, modelId, domainId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (entity.id, entity.name, entity.type, entity.url, entity.username, entity.password, entity.tableName, entity.status, entity.description, entity.modelId, entity.domainId, entity.createdAt or get_current_date(), entity.updatedAt or get_current_date())
        )
    
    def _update(self, conn, entity: Datasource):
        conn.execute(
            "UPDATE datasources SET name = ?, type = ?, url = ?, username = ?, password = ?, tableName = ?, status = ?, description = ?, modelId = ?, domainId = ?, updatedAt = ? WHERE id = ?",
            (entity.name, entity.type, entity.url, entity.username, entity.password, entity.tableName, entity.status, entity.description, entity.modelId, entity.domainId, get_current_date(), entity.id)
        )
    
    def find_by_model(self, model_id: int):
        return self.find_all({"modelId": model_id})
    
    def find_by_domain(self, domain_id: int):
        return self.find_all({"domainId": domain_id})
    
    def toggle_status(self, id: int):
        datasource = self.find_by_id(id)
        if datasource:
            datasource.toggle_status()
            return self.update(datasource)
        return None
