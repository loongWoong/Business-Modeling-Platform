"""
SharedAttribute Repository
"""
from repository.base_repository import BaseRepository
from meta.shared_attribute import SharedAttribute


class SharedAttributeRepository(BaseRepository):
    """SharedAttribute持久化层"""
    
    def __init__(self):
        super().__init__("shared_attributes", SharedAttribute)
    
    def _entity_from_row(self, row: tuple) -> SharedAttribute:
        return SharedAttribute(
            id=row[0],
            name=row[1],
            type=row[2],
            length=row[3],
            precision=row[4],
            description=row[5],
            valueRange=row[6],
            domainId=row[7],
            referenceCount=row[8] if len(row) > 8 else 0
        )
    
    def _insert(self, conn, entity: SharedAttribute):
        conn.execute(
            "INSERT INTO shared_attributes (id, name, type, length, precision, description, valueRange, domainId, referenceCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (entity.id, entity.name, entity.type, entity.length, entity.precision, entity.description, entity.valueRange, entity.domainId, entity.referenceCount)
        )
    
    def _update(self, conn, entity: SharedAttribute):
        conn.execute(
            "UPDATE shared_attributes SET name = ?, type = ?, length = ?, precision = ?, description = ?, valueRange = ?, referenceCount = ? WHERE id = ?",
            (entity.name, entity.type, entity.length, entity.precision, entity.description, entity.valueRange, entity.referenceCount, entity.id)
        )
    
    def find_by_domain(self, domain_id: int):
        return self.find_all({"domainId": domain_id})
