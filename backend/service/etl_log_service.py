"""ETLLog Service"""
from repository.etl_log_repository import ETLLogRepository
from meta.etl_log import ETLLog

class ETLLogService:
    def __init__(self):
        self.repository = ETLLogRepository()
    
    def get_all(self, task_id=None):
        if task_id:
            return self.repository.find_by_task(task_id)
        return self.repository.find_all()
    
    def get_by_id(self, id):
        return self.repository.find_by_id(id)
    
    def create(self, data):
        log = ETLLog.from_dict({**data, "id": 0})
        return self.repository.create(log)
    
    def update(self, id, data):
        log = self.repository.find_by_id(id)
        if not log:
            return None
        for key, value in data.items():
            if hasattr(log, key):
                setattr(log, key, value)
        return self.repository.update(log)
    
    def delete(self, id):
        return self.repository.delete(id)
