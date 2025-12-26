"""
Function Repository
"""
from repository.base_repository import BaseRepository
from meta.function import Function


class FunctionRepository(BaseRepository):
    """Function持久化层"""
    
    def __init__(self):
        super().__init__("functions", Function)
    
    def _entity_from_row(self, row: tuple) -> Function:
        return Function(
            id=row[0],
            name=row[1],
            description=row[2],
            code=row[3],
            inputSchema=row[4],
            returnType=row[5],
            version=row[6],
            metadata=row[7],
            domainId=row[8],
            createdAt=row[9],
            updatedAt=row[10]
        )
    
    def _insert(self, conn, entity: Function):
        conn.execute(
            "INSERT INTO functions (id, name, description, code, inputSchema, returnType, version, metadata, domainId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (entity.id, entity.name, entity.description, entity.code, str(entity.inputSchema) if entity.inputSchema else None, entity.returnType, entity.version, str(entity.metadata) if entity.metadata else None, entity.domainId, entity.createdAt, entity.updatedAt)
        )
    
    def _update(self, conn, entity: Function):
        conn.execute(
            "UPDATE functions SET name = ?, description = ?, code = ?, inputSchema = ?, returnType = ?, version = ?, metadata = ?, updatedAt = ? WHERE id = ?",
            (entity.name, entity.description, entity.code, str(entity.inputSchema) if entity.inputSchema else None, entity.returnType, entity.version, str(entity.metadata) if entity.metadata else None, entity.updatedAt, entity.id)
        )
    
    def find_by_domain(self, domain_id: int):
        return self.find_all({"domainId": domain_id})
