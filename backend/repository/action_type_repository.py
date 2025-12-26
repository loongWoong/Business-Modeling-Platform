"""
ActionType Repository
"""
from repository.base_repository import BaseRepository
from meta.action_type import ActionType


class ActionTypeRepository(BaseRepository):
    """ActionType持久化层"""
    
    def __init__(self):
        super().__init__("action_types", ActionType)
    
    def _entity_from_row(self, row: tuple) -> ActionType:
        return ActionType(
            id=row[0],
            name=row[1],
            description=row[2],
            targetObjectTypeId=row[3],
            inputSchema=row[4],
            outputSchema=row[5],
            requiresApproval=bool(row[6]) if row[6] is not None else False,
            handlerFunction=row[7],
            createdAt=row[8],
            updatedAt=row[9]
        )
    
    def _insert(self, conn, entity: ActionType):
        conn.execute(
            "INSERT INTO action_types (id, name, description, targetObjectTypeId, inputSchema, outputSchema, requiresApproval, handlerFunction, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (entity.id, entity.name, entity.description, entity.targetObjectTypeId, str(entity.inputSchema) if entity.inputSchema else None, str(entity.outputSchema) if entity.outputSchema else None, entity.requiresApproval, entity.handlerFunction, entity.createdAt, entity.updatedAt)
        )
    
    def _update(self, conn, entity: ActionType):
        conn.execute(
            "UPDATE action_types SET name = ?, description = ?, targetObjectTypeId = ?, inputSchema = ?, outputSchema = ?, requiresApproval = ?, handlerFunction = ?, updatedAt = ? WHERE id = ?",
            (entity.name, entity.description, entity.targetObjectTypeId, str(entity.inputSchema) if entity.inputSchema else None, str(entity.outputSchema) if entity.outputSchema else None, entity.requiresApproval, entity.handlerFunction, entity.updatedAt, entity.id)
        )
    
    def find_by_model(self, model_id: int):
        return self.find_all({"targetObjectTypeId": model_id})
