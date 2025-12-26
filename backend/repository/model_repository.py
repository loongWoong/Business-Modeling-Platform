"""
Model Repository
"""
from typing import Optional, List
from repository.base_repository import BaseRepository
from meta.model import Model
from utils import get_current_date


class ModelRepository(BaseRepository):
    """Model持久化层"""
    
    def __init__(self):
        super().__init__("models", Model)
    
    def _entity_from_row(self, row: tuple) -> Model:
        """从数据库行创建Model实体"""
        return Model(
            id=row[0],
            name=row[1],
            code=row[2],
            description=row[3],
            creator=row[4],
            updatedAt=row[5],
            domainId=row[6]
        )
    
    def _insert(self, conn, entity: Model):
        """插入Model"""
        conn.execute(
            "INSERT INTO models (id, name, code, description, creator, updatedAt, domainId) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                entity.id,
                entity.name,
                entity.code,
                entity.description,
                entity.creator or "当前用户",
                entity.updatedAt or get_current_date(),
                entity.domainId
            )
        )
    
    def _update(self, conn, entity: Model):
        """更新Model"""
        conn.execute(
            "UPDATE models SET name = ?, code = ?, description = ?, updatedAt = ? WHERE id = ?",
            (
                entity.name,
                entity.code,
                entity.description,
                get_current_date(),
                entity.id
            )
        )
    
    def find_by_domain(self, domain_id: int) -> List[Model]:
        """根据域ID查找模型"""
        return self.find_all({"domainId": domain_id})
    
    def find_edges(self, model_ids: List[int]) -> List[dict]:
        """查找模型边"""
        if not model_ids:
            return []
        
        conn = self._get_connection()
        try:
            placeholders = ','.join(['?'] * len(model_ids))
            edges = conn.execute(
                f"SELECT * FROM model_edges WHERE source IN ({placeholders}) AND target IN ({placeholders})",
                model_ids * 2
            ).fetchall()
            
            return [{"source": row[0], "target": row[1]} for row in edges]
        finally:
            conn.close()
    
    def delete_with_relations(self, id: int) -> bool:
        """删除模型及其关联数据"""
        conn = self._get_connection()
        try:
            # 删除模型边
            conn.execute("DELETE FROM model_edges WHERE source = ? OR target = ?", (id, id))
            # 删除相关属性
            conn.execute("DELETE FROM properties WHERE modelId = ?", (id,))
            # 删除模型
            conn.execute("DELETE FROM models WHERE id = ?", (id,))
            conn.commit()
            return True
        finally:
            conn.close()
