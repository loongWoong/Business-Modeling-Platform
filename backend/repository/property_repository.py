"""
Property Repository
"""
from typing import Optional, List
import json
from repository.base_repository import BaseRepository
from meta.property import Property


class PropertyRepository(BaseRepository):
    """Property持久化层"""
    
    def __init__(self):
        super().__init__("properties", Property)
    
    def _entity_from_row(self, row: tuple) -> Property:
        """从数据库行创建Property实体"""
        constraints = row[9]
        if isinstance(constraints, str):
            try:
                constraints = json.loads(constraints)
            except json.JSONDecodeError:
                constraints = []
        elif constraints is None:
            constraints = []
        
        return Property(
            id=row[0],
            name=row[1],
            code=row[2],
            type=row[3],
            required=bool(row[4]),
            description=row[5],
            modelId=row[6],
            isPrimaryKey=bool(row[7]),
            isForeignKey=bool(row[8]),
            defaultValue=row[10] if len(row) > 10 else None,
            constraints=constraints,
            sensitivityLevel=row[11] if len(row) > 11 else None,
            maskRule=row[12] if len(row) > 12 else None,
            physicalColumn=row[13] if len(row) > 13 else None,
            foreignKeyTable=row[14] if len(row) > 14 else None,
            foreignKeyColumn=row[15] if len(row) > 15 else None
        )
    
    def _insert(self, conn, entity: Property):
        """插入Property"""
        constraints_json = json.dumps(entity.constraints or [])
        conn.execute(
            """INSERT INTO properties (id, name, code, type, required, description, modelId, 
               isPrimaryKey, isForeignKey, defaultValue, constraints, sensitivityLevel, maskRule, 
               physicalColumn, foreignKeyTable, foreignKeyColumn) 
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                entity.id,
                entity.name,
                entity.code,
                entity.type,
                entity.required,
                entity.description,
                entity.modelId,
                entity.isPrimaryKey,
                entity.isForeignKey,
                entity.defaultValue,
                constraints_json,
                entity.sensitivityLevel,
                entity.maskRule,
                entity.physicalColumn,
                entity.foreignKeyTable,
                entity.foreignKeyColumn
            )
        )
    
    def _update(self, conn, entity: Property):
        """更新Property"""
        constraints_json = json.dumps(entity.constraints or [])
        conn.execute(
            """UPDATE properties SET name = ?, code = ?, type = ?, required = ?, description = ?, 
               isPrimaryKey = ?, isForeignKey = ?, defaultValue = ?, constraints = ?, 
               sensitivityLevel = ?, maskRule = ?, physicalColumn = ?, foreignKeyTable = ?, 
               foreignKeyColumn = ? WHERE id = ?""",
            (
                entity.name,
                entity.code,
                entity.type,
                entity.required,
                entity.description,
                entity.isPrimaryKey,
                entity.isForeignKey,
                entity.defaultValue,
                constraints_json,
                entity.sensitivityLevel,
                entity.maskRule,
                entity.physicalColumn,
                entity.foreignKeyTable,
                entity.foreignKeyColumn,
                entity.id
            )
        )
    
    def find_by_model(self, model_id: int) -> List[Property]:
        """根据模型ID查找属性"""
        return self.find_all({"modelId": model_id})
