"""
Mapping Repository
"""
from repository.base_repository import BaseRepository
from meta.mapping import Mapping


class MappingRepository(BaseRepository):
    """Mapping持久化层"""
    
    def __init__(self):
        super().__init__("mappings", Mapping)
    
    def _entity_from_row(self, row: tuple) -> Mapping:
        return Mapping(
            id=row[0],
            datasourceId=row[1],
            modelId=row[2],
            fieldId=row[3],
            propertyId=row[4],
            createdAt=row[5],
            updatedAt=row[6]
        )
    
    def _insert(self, conn, entity: Mapping):
        conn.execute(
            "INSERT INTO mappings (id, datasourceId, modelId, fieldId, propertyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (entity.id, entity.datasourceId, entity.modelId, entity.fieldId, entity.propertyId, entity.createdAt, entity.updatedAt)
        )
    
    def _update(self, conn, entity: Mapping):
        conn.execute(
            "UPDATE mappings SET datasourceId = ?, modelId = ?, fieldId = ?, propertyId = ?, updatedAt = ? WHERE id = ?",
            (entity.datasourceId, entity.modelId, entity.fieldId, entity.propertyId, entity.updatedAt, entity.id)
        )
    
    def find_by_datasource(self, datasource_id: int):
        return self.find_all({"datasourceId": datasource_id})
    
    def find_by_model(self, model_id: int):
        return self.find_all({"modelId": model_id})
