"""
Relation Repository
"""
from typing import Optional, List
from repository.base_repository import BaseRepository
from meta.relation import Relation


class RelationRepository(BaseRepository):
    """Relation持久化层"""
    
    def __init__(self):
        super().__init__("relations", Relation)
    
    def _entity_from_row(self, row: tuple) -> Relation:
        """从数据库行创建Relation实体"""
        return Relation(
            id=row[0],
            name=row[1],
            sourceModelId=row[2],
            targetModelId=row[3],
            type=row[4] or "one-to-many",
            description=row[5],
            enabled=bool(row[6]) if row[6] is not None else True
        )
    
    def _insert(self, conn, entity: Relation):
        """插入Relation"""
        conn.execute(
            "INSERT INTO relations (id, name, sourceModelId, targetModelId, type, description, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                entity.id,
                entity.name,
                entity.sourceModelId,
                entity.targetModelId,
                entity.type,
                entity.description,
                entity.enabled
            )
        )
        # 同步插入model_edges
        conn.execute(
            "INSERT OR IGNORE INTO model_edges (source, target) VALUES (?, ?)",
            (entity.sourceModelId, entity.targetModelId)
        )
    
    def _update(self, conn, entity: Relation):
        """更新Relation"""
        conn.execute(
            "UPDATE relations SET name = ?, targetModelId = ?, type = ?, description = ?, enabled = ? WHERE id = ?",
            (
                entity.name,
                entity.targetModelId,
                entity.type,
                entity.description,
                entity.enabled,
                entity.id
            )
        )
    
    def find_by_model(self, model_id: int) -> List[Relation]:
        """根据模型ID查找关系"""
        return self.find_all({"sourceModelId": model_id})
    
    def find_by_domain(self, domain_id: int) -> List[Relation]:
        """根据域ID查找关系（通过模型）"""
        conn = self._get_connection()
        try:
            # 获取该域下的所有模型ID
            domain_models = conn.execute(
                "SELECT id FROM models WHERE domainId = ?",
                (domain_id,)
            ).fetchall()
            model_ids = [row[0] for row in domain_models]
            
            if not model_ids:
                return []
            
            placeholders = ','.join(['?'] * len(model_ids))
            relations = conn.execute(
                f"SELECT * FROM relations WHERE sourceModelId IN ({placeholders}) OR targetModelId IN ({placeholders})",
                model_ids * 2
            ).fetchall()
            
            return [self._entity_from_row(row) for row in relations]
        finally:
            conn.close()
    
    def toggle(self, id: int) -> Optional[Relation]:
        """切换关系启用状态"""
        relation = self.find_by_id(id)
        if relation:
            relation.toggle()
            return self.update(relation)
        return None
    
    def delete_with_edge(self, id: int) -> bool:
        """删除关系及其边"""
        conn = self._get_connection()
        try:
            # 先获取关系信息
            relation = conn.execute("SELECT sourceModelId, targetModelId FROM relations WHERE id = ?", (id,)).fetchone()
            if relation:
                # 删除关系
                conn.execute("DELETE FROM relations WHERE id = ?", (id,))
                # 删除model_edges
                conn.execute("DELETE FROM model_edges WHERE source = ? AND target = ?", (relation[0], relation[1]))
                conn.commit()
                return True
            return False
        finally:
            conn.close()
