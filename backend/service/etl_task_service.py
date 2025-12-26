"""ETLTask Service"""
from repository.etl_task_repository import ETLTaskRepository
from meta.etl_task import ETLTask

class ETLTaskService:
    def __init__(self):
        self.repository = ETLTaskRepository()
    
    def get_all(self):
        return self.repository.find_all()
    
    def get_by_id(self, id):
        return self.repository.find_by_id(id)
    
    def create(self, data):
        task = ETLTask.from_dict({**data, "id": 0})
        return self.repository.create(task)
    
    def update(self, id, data):
        task = self.repository.find_by_id(id)
        if not task:
            return None
        for key, value in data.items():
            if hasattr(task, key):
                setattr(task, key, value)
        return self.repository.update(task)
    
    def delete(self, id):
        return self.repository.delete(id)
