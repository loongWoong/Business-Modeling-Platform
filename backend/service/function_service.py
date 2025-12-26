"""Function Service"""
from repository.function_repository import FunctionRepository
from meta.function import Function

class FunctionService:
    def __init__(self):
        self.repository = FunctionRepository()
    
    def get_all(self, domain_id=None):
        if domain_id:
            return self.repository.find_by_domain(domain_id)
        return self.repository.find_all()
    
    def get_by_id(self, id):
        return self.repository.find_by_id(id)
    
    def create(self, data):
        func = Function.from_dict({**data, "id": 0})
        return self.repository.create(func)
    
    def update(self, id, data):
        func = self.repository.find_by_id(id)
        if not func:
            return None
        for key, value in data.items():
            if hasattr(func, key):
                setattr(func, key, value)
        return self.repository.update(func)
    
    def delete(self, id):
        return self.repository.delete(id)
