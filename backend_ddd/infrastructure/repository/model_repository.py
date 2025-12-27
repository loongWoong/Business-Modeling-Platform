"""
Model聚合仓储
负责Model聚合的持久化，包括Properties和Relations
"""
from typing import Optional, List
from infrastructure.repository.base_repository import IRepository
from infrastructure.persistence.db_connection import get_db_connection, get_current_date
from meta.model import Model, Property
from meta.shared import Relation
import json


class ModelRepository(IRepository[Model]):
    """Model聚合仓储"""
    
    def find_by_id(self, id: int) -> Optional[Model]:
        """根据ID查找Model聚合（包含Properties和Relations）"""
        conn = get_db_connection()
        try:
            model_row = conn.execute(
                "SELECT * FROM models WHERE id = ?",
                (id,)
            ).fetchone()
            
            if not model_row:
                return None
            
            model = self._model_from_row(model_row)
            
            properties = self._load_properties(conn, id)
            for prop in properties:
                model._properties.append(prop)
            
            relations = self._load_relations(conn, id)
            for relation in relations:
                model._relations.append(relation)
            
            return model
        finally:
            conn.close()
    
    def find_all(self, filters: Optional[dict] = None) -> List[Model]:
        """查找所有Model聚合"""
        conn = get_db_connection()
        try:
            query = "SELECT * FROM models"
            params = []
            
            if filters:
                conditions = []
                for key, value in filters.items():
                    conditions.append(f"{key} = ?")
                    params.append(value)
                if conditions:
                    query += " WHERE " + " AND ".join(conditions)
            
            rows = conn.execute(query, tuple(params)).fetchall()
            models = []
            
            for row in rows:
                model = self._model_from_row(row)
                model_id = row[0]
                
                properties = self._load_properties(conn, model_id)
                for prop in properties:
                    model._properties.append(prop)
                
                relations = self._load_relations(conn, model_id)
                for relation in relations:
                    model._relations.append(relation)
                
                models.append(model)
            
            return models
        finally:
            conn.close()
    
    def save(self, aggregate: Model) -> Model:
        """保存Model聚合（包括Properties和Relations）"""
        conn = get_db_connection()
        try:
            is_valid, error = aggregate.validate_code()
            if not is_valid:
                raise ValueError(error)
            
            if aggregate.id and self._exists(conn, aggregate.id):
                self._update_model(conn, aggregate)
            else:
                aggregate = self._create_model(conn, aggregate)
            
            self._save_properties(conn, aggregate)
            self._save_relations(conn, aggregate)
            
            conn.commit()
            return aggregate
        finally:
            conn.close()
    
    def delete(self, id: int) -> bool:
        """删除Model聚合（包括Properties和Relations）"""
        conn = get_db_connection()
        try:
            conn.execute("DELETE FROM relations WHERE sourceModelId = ? OR targetModelId = ?", (id, id))
            conn.execute("DELETE FROM properties WHERE modelId = ?", (id,))
            result = conn.execute("DELETE FROM models WHERE id = ?", (id,))
            conn.commit()
            return result.rowcount > 0
        finally:
            conn.close()
    
    def _exists(self, conn, id: int) -> bool:
        result = conn.execute("SELECT COUNT(*) FROM models WHERE id = ?", (id,)).fetchone()
        return result[0] > 0
    
    def _create_model(self, conn, model: Model) -> Model:
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM models").fetchone()[0]
        model.id = next_id
        
        conn.execute(
            "INSERT INTO models (id, name, code, description, creator, updatedAt, domainId) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                model.id,
                model.name,
                model.code,
                model.description,
                model.creator or "当前用户",
                model.updatedAt or get_current_date(),
                model.domainId
            )
        )
        return model
    
    def _update_model(self, conn, model: Model) -> None:
        conn.execute(
            "UPDATE models SET name = ?, code = ?, description = ?, updatedAt = ? WHERE id = ?",
            (
                model.name,
                model.code,
                model.description,
                get_current_date(),
                model.id
            )
        )
    
    def _save_properties(self, conn, model: Model) -> None:
        existing_props = {p.id: p for p in self._load_properties(conn, model.id)}
        current_prop_ids = {p.id for p in model.properties}
        
        for prop_id in existing_props:
            if prop_id not in current_prop_ids:
                conn.execute("DELETE FROM properties WHERE id = ?", (prop_id,))
        
        for prop in model.properties:
            if prop.id and prop.id in existing_props:
                self._update_property(conn, prop)
            else:
                self._create_property(conn, prop)
    
    def _create_property(self, conn, prop: Property) -> None:
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM properties").fetchone()[0]
        prop.id = next_id
        
        constraints_json = json.dumps(prop.constraints) if prop.constraints else None
        
        conn.execute(
            """INSERT INTO properties 
            (id, name, code, type, required, description, modelId, isPrimaryKey, isForeignKey, 
             defaultValue, constraints, sensitivityLevel, maskRule, physicalColumn, 
             foreignKeyTable, foreignKeyColumn) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                prop.id, prop.name, prop.code, prop.type, prop.required, prop.description,
                prop.modelId, prop.isPrimaryKey, prop.isForeignKey, prop.defaultValue,
                constraints_json, prop.sensitivityLevel, prop.maskRule, prop.physicalColumn,
                prop.foreignKeyTable, prop.foreignKeyColumn
            )
        )
    
    def _update_property(self, conn, prop: Property) -> None:
        constraints_json = json.dumps(prop.constraints) if prop.constraints else None
        
        conn.execute(
            """UPDATE properties SET name = ?, code = ?, type = ?, required = ?, description = ?,
            isPrimaryKey = ?, isForeignKey = ?, defaultValue = ?, constraints = ?,
            sensitivityLevel = ?, maskRule = ?, physicalColumn = ?, foreignKeyTable = ?,
            foreignKeyColumn = ? WHERE id = ?""",
            (
                prop.name, prop.code, prop.type, prop.required, prop.description,
                prop.isPrimaryKey, prop.isForeignKey, prop.defaultValue, constraints_json,
                prop.sensitivityLevel, prop.maskRule, prop.physicalColumn,
                prop.foreignKeyTable, prop.foreignKeyColumn, prop.id
            )
        )
    
    def _save_relations(self, conn, model: Model) -> None:
        existing_relations = {r.id: r for r in self._load_relations(conn, model.id)}
        current_relation_ids = {r.id for r in model.relations}
        
        for rel_id in existing_relations:
            if rel_id not in current_relation_ids:
                conn.execute("DELETE FROM relations WHERE id = ?", (rel_id,))
        
        for relation in model.relations:
            if relation.id and relation.id in existing_relations:
                self._update_relation(conn, relation)
            else:
                self._create_relation(conn, relation)
    
    def _create_relation(self, conn, relation: Relation) -> None:
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM relations").fetchone()[0]
        relation.id = next_id
        
        conn.execute(
            "INSERT INTO relations (id, name, sourceModelId, targetModelId, type, description, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                relation.id, relation.name, relation.sourceModelId, relation.targetModelId,
                relation.type, relation.description, relation.enabled
            )
        )
    
    def _update_relation(self, conn, relation: Relation) -> None:
        conn.execute(
            "UPDATE relations SET name = ?, type = ?, description = ?, enabled = ? WHERE id = ?",
            (relation.name, relation.type, relation.description, relation.enabled, relation.id)
        )
    
    def _load_properties(self, conn, model_id: int) -> List[Property]:
        rows = conn.execute("SELECT * FROM properties WHERE modelId = ?", (model_id,)).fetchall()
        properties = []
        for row in rows:
            prop = self._property_from_row(row)
            properties.append(prop)
        return properties
    
    def _load_relations(self, conn, model_id: int) -> List[Relation]:
        rows = conn.execute(
            "SELECT * FROM relations WHERE sourceModelId = ? OR targetModelId = ?",
            (model_id, model_id)
        ).fetchall()
        relations = []
        for row in rows:
            relation = self._relation_from_row(row)
            relations.append(relation)
        return relations
    
    def _model_from_row(self, row: tuple) -> Model:
        return Model(
            id=row[0],
            name=row[1],
            code=row[2],
            description=row[3],
            creator=row[4],
            updatedAt=row[5],
            domainId=row[6]
        )
    
    def _property_from_row(self, row: tuple) -> Property:
        constraints = None
        if row[10]:
            try:
                constraints = json.loads(row[10])
            except:
                constraints = []
        
        return Property(
            id=row[0],
            name=row[1],
            code=row[2],
            type=row[3],
            modelId=row[6],
            required=bool(row[4]) if row[4] is not None else False,
            description=row[5],
            isPrimaryKey=bool(row[7]) if row[7] is not None else False,
            isForeignKey=bool(row[8]) if row[8] is not None else False,
            defaultValue=row[9],
            constraints=constraints,
            sensitivityLevel=row[11],
            maskRule=row[12],
            physicalColumn=row[13],
            foreignKeyTable=row[14],
            foreignKeyColumn=row[15]
        )
    
    def _relation_from_row(self, row: tuple) -> Relation:
        return Relation(
            id=row[0],
            name=row[1],
            sourceModelId=row[2],
            targetModelId=row[3],
            type=row[4],
            description=row[5],
            enabled=bool(row[6]) if row[6] is not None else True
        )
