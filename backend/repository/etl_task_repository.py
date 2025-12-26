"""
ETLTask Repository
"""
from repository.base_repository import BaseRepository
from meta.etl_task import ETLTask
import json


class ETLTaskRepository(BaseRepository):
    """ETLTask持久化层"""
    
    def __init__(self):
        super().__init__("etl_tasks", ETLTask)
    
    def _entity_from_row(self, row: tuple) -> ETLTask:
        config = row[7]
        if isinstance(config, str):
            try:
                config = json.loads(config)
            except json.JSONDecodeError:
                config = None
        
        return ETLTask(
            id=row[0],
            name=row[1],
            description=row[2],
            sourceDatasourceId=row[3],
            targetModelId=row[4],
            status=row[5] or "inactive",
            schedule=row[6],
            config=config,
            createdAt=row[8],
            updatedAt=row[9],
            lastRun=row[10],
            nextRun=row[11]
        )
    
    def _insert(self, conn, entity: ETLTask):
        config_json = json.dumps(entity.config) if entity.config else None
        conn.execute(
            "INSERT INTO etl_tasks (id, name, description, sourceDatasourceId, targetModelId, status, schedule, config, createdAt, updatedAt, lastRun, nextRun) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (entity.id, entity.name, entity.description, entity.sourceDatasourceId, entity.targetModelId, entity.status, entity.schedule, config_json, entity.createdAt, entity.updatedAt, entity.lastRun, entity.nextRun)
        )
    
    def _update(self, conn, entity: ETLTask):
        config_json = json.dumps(entity.config) if entity.config else None
        conn.execute(
            "UPDATE etl_tasks SET name = ?, description = ?, sourceDatasourceId = ?, targetModelId = ?, status = ?, schedule = ?, config = ?, updatedAt = ?, lastRun = ?, nextRun = ? WHERE id = ?",
            (entity.name, entity.description, entity.sourceDatasourceId, entity.targetModelId, entity.status, entity.schedule, config_json, entity.updatedAt, entity.lastRun, entity.nextRun, entity.id)
        )
