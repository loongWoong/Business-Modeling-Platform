"""
Domain仓储
Domain不是聚合根，但需要持久化
"""
from typing import Optional, List
from infrastructure.persistence.db_connection import get_db_connection, get_current_date
from meta.shared import Domain


class DomainRepository:
    """Domain仓储"""
    
    def find_by_id(self, id: int) -> Optional[Domain]:
        """根据ID查找Domain"""
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT * FROM domains WHERE id = ?", (id,)).fetchone()
            return self._domain_from_row(row) if row else None
        finally:
            conn.close()
    
    def find_all(self) -> List[Domain]:
        """查找所有Domain"""
        conn = get_db_connection()
        try:
            rows = conn.execute("SELECT * FROM domains").fetchall()
            return [self._domain_from_row(row) for row in rows]
        finally:
            conn.close()
    
    def save(self, domain: Domain) -> Domain:
        """保存Domain"""
        conn = get_db_connection()
        try:
            if domain.id and self._exists(conn, domain.id):
                self._update(conn, domain)
            else:
                domain = self._create(conn, domain)
            conn.commit()
            return domain
        finally:
            conn.close()
    
    def delete(self, id: int) -> bool:
        """删除Domain"""
        conn = get_db_connection()
        try:
            result = conn.execute("DELETE FROM domains WHERE id = ?", (id,))
            conn.commit()
            return result.rowcount > 0
        finally:
            conn.close()
    
    def _exists(self, conn, id: int) -> bool:
        result = conn.execute("SELECT COUNT(*) FROM domains WHERE id = ?", (id,)).fetchone()
        return result[0] > 0
    
    def _create(self, conn, domain: Domain) -> Domain:
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM domains").fetchone()[0]
        domain.id = next_id
        conn.execute(
            "INSERT INTO domains (id, name, description, owner, updatedAt) VALUES (?, ?, ?, ?, ?)",
            (domain.id, domain.name, domain.description, domain.owner, domain.updatedAt or get_current_date())
        )
        return domain
    
    def _update(self, conn, domain: Domain) -> None:
        conn.execute(
            "UPDATE domains SET name = ?, description = ?, owner = ?, updatedAt = ? WHERE id = ?",
            (domain.name, domain.description, domain.owner, get_current_date(), domain.id)
        )
    
    def _domain_from_row(self, row: tuple) -> Domain:
        return Domain(
            id=row[0], name=row[1], description=row[2], owner=row[3], updatedAt=row[4]
        )
