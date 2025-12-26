"""
ModelTableAssociation Repository
"""
from repository.base_repository import BaseRepository
from meta.model_table_association import ModelTableAssociation


class ModelTableAssociationRepository(BaseRepository):
    """ModelTableAssociation持久化层"""
    
    def __init__(self):
        super().__init__("model_table_associations", ModelTableAssociation)
    
    def _entity_from_row(self, row: tuple) -> ModelTableAssociation:
        return ModelTableAssociation(
            id=row[0],
            modelId=row[1],
            datasourceId=row[2],
            tableName=row[3],
            status=row[4] or "active",
            createdAt=row[5],
            updatedAt=row[6]
        )
    
    def _insert(self, conn, entity: ModelTableAssociation):
        conn.execute(
            "INSERT INTO model_table_associations (id, modelId, datasourceId, tableName, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (entity.id, entity.modelId, entity.datasourceId, entity.tableName, entity.status, entity.createdAt, entity.updatedAt)
        )
    
    def _update(self, conn, entity: ModelTableAssociation):
        conn.execute(
            "UPDATE model_table_associations SET modelId = ?, datasourceId = ?, tableName = ?, status = ?, updatedAt = ? WHERE id = ?",
            (entity.modelId, entity.datasourceId, entity.tableName, entity.status, entity.updatedAt, entity.id)
        )
    
    def find_by_model(self, model_id: int):
        return self.find_all({"modelId": model_id})
    
    def find_by_datasource(self, datasource_id: int):
        return self.find_all({"datasourceId": datasource_id})
