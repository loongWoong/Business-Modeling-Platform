"""
基础Repository类
提供通用的数据库操作方法
"""
from typing import Optional, List, Dict, Any
from utils import get_db_connection


class BaseRepository:
    """基础Repository类"""
    
    def __init__(self, table_name: str, entity_class):
        self.table_name = table_name
        self.entity_class = entity_class
    
    def _get_connection(self):
        """获取数据库连接"""
        return get_db_connection()
    
    def _row_to_dict(self, row: tuple, columns: List[str]) -> dict:
        """将数据库行转换为字典"""
        return dict(zip(columns, row))
    
    def find_by_id(self, id: int) -> Optional[Any]:
        """根据ID查找实体"""
        conn = self._get_connection()
        try:
            result = conn.execute(
                f"SELECT * FROM {self.table_name} WHERE id = ?",
                (id,)
            ).fetchone()
            if result:
                return self._entity_from_row(result)
            return None
        finally:
            conn.close()
    
    def find_all(self, filters: Optional[Dict[str, Any]] = None) -> List[Any]:
        """查找所有实体"""
        conn = self._get_connection()
        try:
            if filters:
                conditions = []
                params = []
                for key, value in filters.items():
                    conditions.append(f"{key} = ?")
                    params.append(value)
                where_clause = " WHERE " + " AND ".join(conditions)
                query = f"SELECT * FROM {self.table_name}{where_clause}"
                results = conn.execute(query, tuple(params)).fetchall()
            else:
                results = conn.execute(f"SELECT * FROM {self.table_name}").fetchall()
            
            return [self._entity_from_row(row) for row in results]
        finally:
            conn.close()
    
    def save(self, entity: Any) -> Any:
        """保存实体（创建或更新）"""
        if hasattr(entity, 'id') and entity.id and self.find_by_id(entity.id):
            return self.update(entity)
        else:
            return self.create(entity)
    
    def create(self, entity: Any) -> Any:
        """创建实体"""
        conn = self._get_connection()
        try:
            # 获取下一个ID
            next_id = conn.execute(
                f"SELECT COALESCE(MAX(id), 0) + 1 FROM {self.table_name}"
            ).fetchone()[0]
            
            # 设置ID
            entity.id = next_id
            
            # 插入数据
            self._insert(conn, entity)
            conn.commit()
            return entity
        finally:
            conn.close()
    
    def update(self, entity: Any) -> Any:
        """更新实体"""
        conn = self._get_connection()
        try:
            self._update(conn, entity)
            conn.commit()
            return entity
        finally:
            conn.close()
    
    def delete(self, id: int) -> bool:
        """删除实体"""
        conn = self._get_connection()
        try:
            result = conn.execute(
                f"DELETE FROM {self.table_name} WHERE id = ?",
                (id,)
            )
            conn.commit()
            return result.rowcount > 0
        finally:
            conn.close()
    
    def _entity_from_row(self, row: tuple) -> Any:
        """从数据库行创建实体（子类实现）"""
        raise NotImplementedError("子类必须实现此方法")
    
    def _insert(self, conn, entity: Any):
        """插入实体（子类实现）"""
        raise NotImplementedError("子类必须实现此方法")
    
    def _update(self, conn, entity: Any):
        """更新实体（子类实现）"""
        raise NotImplementedError("子类必须实现此方法")
