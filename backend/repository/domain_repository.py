"""
Domain Repository
"""
from typing import Optional, List
from repository.base_repository import BaseRepository
from meta.domain import Domain
from utils import get_current_date


class DomainRepository(BaseRepository):
    """Domain持久化层"""
    
    def __init__(self):
        super().__init__("domains", Domain)
    
    def _entity_from_row(self, row: tuple) -> Domain:
        """从数据库行创建Domain实体"""
        return Domain(
            id=row[0],
            name=row[1],
            description=row[2],
            owner=row[3],
            updatedAt=row[4]
        )
    
    def _insert(self, conn, entity: Domain):
        """插入Domain"""
        conn.execute(
            "INSERT INTO domains (id, name, description, owner, updatedAt) VALUES (?, ?, ?, ?, ?)",
            (
                entity.id,
                entity.name,
                entity.description,
                entity.owner,
                entity.updatedAt or get_current_date()
            )
        )
    
    def _update(self, conn, entity: Domain):
        """更新Domain"""
        conn.execute(
            "UPDATE domains SET name = ?, description = ?, owner = ?, updatedAt = ? WHERE id = ?",
            (
                entity.name,
                entity.description,
                entity.owner,
                get_current_date(),
                entity.id
            )
        )
    
    def find_edges(self) -> List[dict]:
        """查找域边"""
        conn = self._get_connection()
        try:
            edges = conn.execute("SELECT * FROM domain_edges").fetchall()
            return [{"source": row[0], "target": row[1]} for row in edges]
        finally:
            conn.close()
    
    def delete_with_edges(self, id: int) -> bool:
        """删除域及其边"""
        conn = self._get_connection()
        try:
            # 删除域边
            conn.execute("DELETE FROM domain_edges WHERE source = ? OR target = ?", (id, id))
            # 删除域
            conn.execute("DELETE FROM domains WHERE id = ?", (id,))
            conn.commit()
            return True
        finally:
            conn.close()
