"""ActionType Service"""
from repository.action_type_repository import ActionTypeRepository
from meta.action_type import ActionType

class ActionTypeService:
    def __init__(self):
        self.repository = ActionTypeRepository()
    
    def get_all(self, model_id=None):
        if model_id:
            return self.repository.find_by_model(model_id)
        return self.repository.find_all()
    
    def get_by_id(self, id):
        return self.repository.find_by_id(id)
    
    def create(self, data):
        action_type = ActionType.from_dict({**data, "id": 0})
        return self.repository.create(action_type)
    
    def update(self, id, data):
        action_type = self.repository.find_by_id(id)
        if not action_type:
            return None
        for key, value in data.items():
            if hasattr(action_type, key):
                setattr(action_type, key, value)
        return self.repository.update(action_type)
    
    def delete(self, id):
        return self.repository.delete(id)
