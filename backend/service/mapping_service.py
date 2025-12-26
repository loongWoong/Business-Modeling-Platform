"""Mapping Service"""
from repository.mapping_repository import MappingRepository
from meta.mapping import Mapping

class MappingService:
    def __init__(self):
        self.repository = MappingRepository()
    
    def get_all(self, datasource_id=None, model_id=None):
        if datasource_id:
            return self.repository.find_by_datasource(datasource_id)
        if model_id:
            return self.repository.find_by_model(model_id)
        return self.repository.find_all()
    
    def get_by_id(self, id):
        return self.repository.find_by_id(id)
    
    def create(self, data):
        mapping = Mapping.from_dict({**data, "id": 0})
        return self.repository.create(mapping)
    
    def update(self, id, data):
        mapping = self.repository.find_by_id(id)
        if not mapping:
            return None
        for key, value in data.items():
            if hasattr(mapping, key):
                setattr(mapping, key, value)
        return self.repository.update(mapping)
    
    def delete(self, id):
        return self.repository.delete(id)
