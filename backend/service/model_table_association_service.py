"""ModelTableAssociation Service"""
from repository.model_table_association_repository import ModelTableAssociationRepository
from meta.model_table_association import ModelTableAssociation

class ModelTableAssociationService:
    def __init__(self):
        self.repository = ModelTableAssociationRepository()
    
    def get_all(self, model_id=None, datasource_id=None):
        if model_id:
            return self.repository.find_by_model(model_id)
        if datasource_id:
            return self.repository.find_by_datasource(datasource_id)
        return self.repository.find_all()
    
    def get_by_id(self, id):
        return self.repository.find_by_id(id)
    
    def create(self, data):
        assoc = ModelTableAssociation.from_dict({**data, "id": 0})
        return self.repository.create(assoc)
    
    def update(self, id, data):
        assoc = self.repository.find_by_id(id)
        if not assoc:
            return None
        for key, value in data.items():
            if hasattr(assoc, key):
                setattr(assoc, key, value)
        return self.repository.update(assoc)
    
    def delete(self, id):
        return self.repository.delete(id)
