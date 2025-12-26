"""
Indicator Repository
"""
from repository.base_repository import BaseRepository
from meta.indicator import Indicator


class IndicatorRepository(BaseRepository):
    """Indicator持久化层"""
    
    def __init__(self):
        super().__init__("indicators", Indicator)
    
    def _entity_from_row(self, row: tuple) -> Indicator:
        return Indicator(
            id=row[0],
            name=row[1],
            expression=row[2] or "",
            returnType=row[3] or "number",
            unit=row[4],
            description=row[5],
            status=row[6] or "draft",
            domainId=row[7],
            createdAt=row[8],
            updatedAt=row[9]
        )
    
    def _insert(self, conn, entity: Indicator):
        conn.execute(
            "INSERT INTO indicators (id, name, expression, returnType, unit, description, status, domainId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (entity.id, entity.name, entity.expression, entity.returnType, entity.unit, entity.description, entity.status, entity.domainId, entity.createdAt, entity.updatedAt)
        )
    
    def _update(self, conn, entity: Indicator):
        conn.execute(
            "UPDATE indicators SET name = ?, expression = ?, returnType = ?, unit = ?, description = ?, status = ?, updatedAt = ? WHERE id = ?",
            (entity.name, entity.expression, entity.returnType, entity.unit, entity.description, entity.status, entity.updatedAt, entity.id)
        )
    
    def find_by_domain(self, domain_id: int):
        return self.find_all({"domainId": domain_id})
