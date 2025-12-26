"""
Property Service
"""
from typing import Optional, List
from repository.property_repository import PropertyRepository
from meta.property import Property


class PropertyService:
    """Property业务逻辑层"""
    
    def __init__(self):
        self.repository = PropertyRepository()
    
    def get_all(self, model_id: Optional[int] = None) -> List[Property]:
        """获取所有属性"""
        if model_id:
            return self.repository.find_by_model(model_id)
        return self.repository.find_all()
    
    def get_by_id(self, id: int) -> Optional[Property]:
        """根据ID获取属性"""
        return self.repository.find_by_id(id)
    
    def create(self, data: dict) -> Property:
        """创建属性"""
        property = Property.from_dict({
            "id": 0,
            "name": data["name"],
            "code": data.get("code", data["name"].lower().replace(" ", "_")),
            "type": data["type"],
            "required": data.get("required", False),
            "description": data.get("description"),
            "modelId": data["modelId"],
            "isPrimaryKey": data.get("isPrimaryKey", False),
            "isForeignKey": data.get("isForeignKey", False),
            "defaultValue": data.get("defaultValue"),
            "constraints": data.get("constraints", []),
            "sensitivityLevel": data.get("sensitivityLevel", "public"),
            "maskRule": data.get("maskRule"),
            "physicalColumn": data.get("physicalColumn", data["name"].lower().replace(" ", "_")),
            "foreignKeyTable": data.get("foreignKeyTable"),
            "foreignKeyColumn": data.get("foreignKeyColumn")
        })
        return self.repository.create(property)
    
    def update(self, id: int, data: dict) -> Optional[Property]:
        """更新属性"""
        property = self.repository.find_by_id(id)
        if not property:
            return None
        
        # 更新字段
        if "name" in data:
            property.name = data["name"]
        if "code" in data:
            property.code = data["code"]
        if "type" in data:
            property.type = data["type"]
        if "required" in data:
            property.required = data["required"]
        if "description" in data:
            property.description = data["description"]
        if "isPrimaryKey" in data:
            property.isPrimaryKey = data["isPrimaryKey"]
        if "isForeignKey" in data:
            property.isForeignKey = data["isForeignKey"]
        if "defaultValue" in data:
            property.defaultValue = data["defaultValue"]
        if "constraints" in data:
            property.constraints = data["constraints"]
        if "sensitivityLevel" in data:
            property.sensitivityLevel = data["sensitivityLevel"]
        if "maskRule" in data:
            property.maskRule = data["maskRule"]
        if "physicalColumn" in data:
            property.physicalColumn = data["physicalColumn"]
        if "foreignKeyTable" in data:
            property.foreignKeyTable = data["foreignKeyTable"]
        if "foreignKeyColumn" in data:
            property.foreignKeyColumn = data["foreignKeyColumn"]
        
        return self.repository.update(property)
    
    def delete(self, id: int) -> bool:
        """删除属性"""
        return self.repository.delete(id)
