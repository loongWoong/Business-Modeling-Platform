"""
Datasource聚合仓储
负责Datasource聚合的持久化，包括Mappings和ModelTableAssociations
"""
from typing import Optional, List
from infrastructure.repository.base_repository import IRepository
from infrastructure.persistence.db_connection import get_db_connection, get_current_date
from meta.datasource import Datasource, ModelTableAssociation
from meta.shared import Mapping


class DatasourceRepository(IRepository[Datasource]):
    """Datasource聚合仓储"""
    
    def find_by_id(self, id: int) -> Optional[Datasource]:
        """根据ID查找Datasource聚合"""
        conn = get_db_connection()
        try:
            row = conn.execute("SELECT * FROM datasources WHERE id = ?", (id,)).fetchone()
            if not row:
                return None
            
            datasource = self._datasource_from_row(row)
            
            mappings = self._load_mappings(conn, id)
            for mapping in mappings:
                datasource._mappings.append(mapping)
            
            associations = self._load_associations(conn, id)
            for assoc in associations:
                datasource._modelTableAssociations.append(assoc)
            
            return datasource
        finally:
            conn.close()
    
    def find_all(self, filters: Optional[dict] = None) -> List[Datasource]:
        """查找所有Datasource聚合"""
        conn = get_db_connection()
        try:
            query = "SELECT * FROM datasources"
            params = []
            if filters:
                conditions = [f"{k} = ?" for k in filters.keys()]
                params = list(filters.values())
                query += " WHERE " + " AND ".join(conditions)
            
            rows = conn.execute(query, tuple(params)).fetchall()
            datasources = []
            for row in rows:
                ds = self._datasource_from_row(row)
                ds_id = row[0]
                
                mappings = self._load_mappings(conn, ds_id)
                for m in mappings:
                    ds._mappings.append(m)
                
                associations = self._load_associations(conn, ds_id)
                for a in associations:
                    ds._modelTableAssociations.append(a)
                
                datasources.append(ds)
            
            return datasources
        finally:
            conn.close()
    
    def save(self, aggregate: Datasource) -> Datasource:
        """保存Datasource聚合"""
        conn = get_db_connection()
        try:
            is_valid, error = aggregate.validate_connection()
            if not is_valid:
                raise ValueError(error)
            
            if aggregate.id and self._exists(conn, aggregate.id):
                self._update_datasource(conn, aggregate)
            else:
                aggregate = self._create_datasource(conn, aggregate)
            
            self._save_mappings(conn, aggregate)
            self._save_associations(conn, aggregate)
            
            conn.commit()
            return aggregate
        finally:
            conn.close()
    
    def delete(self, id: int) -> bool:
        """删除Datasource聚合"""
        conn = get_db_connection()
        try:
            conn.execute("DELETE FROM mappings WHERE datasourceId = ?", (id,))
            conn.execute("DELETE FROM model_table_associations WHERE datasourceId = ?", (id,))
            result = conn.execute("DELETE FROM datasources WHERE id = ?", (id,))
            conn.commit()
            return result.rowcount > 0
        finally:
            conn.close()
    
    def _exists(self, conn, id: int) -> bool:
        result = conn.execute("SELECT COUNT(*) FROM datasources WHERE id = ?", (id,)).fetchone()
        return result[0] > 0
    
    def _create_datasource(self, conn, ds: Datasource) -> Datasource:
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM datasources").fetchone()[0]
        ds.id = next_id
        conn.execute(
            """INSERT INTO datasources 
            (id, name, type, url, username, password, tableName, status, description, 
             modelId, domainId, createdAt, updatedAt) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (ds.id, ds.name, ds.type, ds.url, ds.username, ds.password, ds.tableName,
             ds.status, ds.description, ds.modelId, ds.domainId, ds.createdAt or get_current_date(),
             ds.updatedAt or get_current_date())
        )
        return ds
    
    def _update_datasource(self, conn, ds: Datasource) -> None:
        conn.execute(
            """UPDATE datasources SET name = ?, type = ?, url = ?, username = ?, password = ?,
            tableName = ?, status = ?, description = ?, modelId = ?, domainId = ?, updatedAt = ?
            WHERE id = ?""",
            (ds.name, ds.type, ds.url, ds.username, ds.password, ds.tableName, ds.status,
             ds.description, ds.modelId, ds.domainId, get_current_date(), ds.id)
        )
    
    def _save_mappings(self, conn, ds: Datasource) -> None:
        existing = {m.id: m for m in self._load_mappings(conn, ds.id)}
        current_ids = {m.id for m in ds.mappings}
        
        for mid in existing:
            if mid not in current_ids:
                conn.execute("DELETE FROM mappings WHERE id = ?", (mid,))
        
        for m in ds.mappings:
            if m.id and m.id in existing:
                self._update_mapping(conn, m)
            else:
                self._create_mapping(conn, m)
    
    def _create_mapping(self, conn, m: Mapping) -> None:
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM mappings").fetchone()[0]
        m.id = next_id
        conn.execute(
            "INSERT INTO mappings (id, datasourceId, modelId, fieldId, propertyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (m.id, m.datasourceId, m.modelId, m.fieldId, m.propertyId, m.createdAt or get_current_date(), m.updatedAt or get_current_date())
        )
    
    def _update_mapping(self, conn, m: Mapping) -> None:
        conn.execute(
            "UPDATE mappings SET fieldId = ?, propertyId = ?, updatedAt = ? WHERE id = ?",
            (m.fieldId, m.propertyId, get_current_date(), m.id)
        )
    
    def _save_associations(self, conn, ds: Datasource) -> None:
        existing = {a.id: a for a in self._load_associations(conn, ds.id)}
        current_ids = {a.id for a in ds.modelTableAssociations}
        
        for aid in existing:
            if aid not in current_ids:
                conn.execute("DELETE FROM model_table_associations WHERE id = ?", (aid,))
        
        for a in ds.modelTableAssociations:
            if a.id and a.id in existing:
                self._update_association(conn, a)
            else:
                self._create_association(conn, a)
    
    def _create_association(self, conn, a: ModelTableAssociation) -> None:
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM model_table_associations").fetchone()[0]
        a.id = next_id
        conn.execute(
            "INSERT INTO model_table_associations (id, modelId, datasourceId, tableName, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (a.id, a.modelId, a.datasourceId, a.tableName, a.status, a.createdAt or get_current_date(), a.updatedAt or get_current_date())
        )
    
    def _update_association(self, conn, a: ModelTableAssociation) -> None:
        conn.execute(
            "UPDATE model_table_associations SET tableName = ?, status = ?, updatedAt = ? WHERE id = ?",
            (a.tableName, a.status, get_current_date(), a.id)
        )
    
    def _load_mappings(self, conn, ds_id: int) -> List[Mapping]:
        rows = conn.execute("SELECT * FROM mappings WHERE datasourceId = ?", (ds_id,)).fetchall()
        return [self._mapping_from_row(row) for row in rows]
    
    def _load_associations(self, conn, ds_id: int) -> List[ModelTableAssociation]:
        rows = conn.execute("SELECT * FROM model_table_associations WHERE datasourceId = ?", (ds_id,)).fetchall()
        return [self._association_from_row(row) for row in rows]
    
    def _datasource_from_row(self, row: tuple) -> Datasource:
        return Datasource(
            id=row[0], name=row[1], type=row[2], url=row[3], username=row[4],
            password=row[5], tableName=row[6], status=row[7], description=row[8],
            modelId=row[9], domainId=row[10], createdAt=row[11], updatedAt=row[12]
        )
    
    def _mapping_from_row(self, row: tuple) -> Mapping:
        return Mapping(
            id=row[0], datasourceId=row[1], modelId=row[2], fieldId=row[3],
            propertyId=row[4], createdAt=row[5], updatedAt=row[6]
        )
    
    def _association_from_row(self, row: tuple) -> ModelTableAssociation:
        return ModelTableAssociation(
            id=row[0], modelId=row[1], datasourceId=row[2], tableName=row[3],
            status=row[4], createdAt=row[5], updatedAt=row[6]
        )
