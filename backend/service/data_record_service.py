"""
DataRecord Service
"""
from typing import Optional, List
from repository.data_record_repository import DataRecordRepository
from repository.property_repository import PropertyRepository
from meta.data_record import DataRecord


class DataRecordService:
    """DataRecord业务逻辑层"""
    
    def __init__(self):
        self.repository = DataRecordRepository()
        self.property_repo = PropertyRepository()
    
    def get_all(self, model_id: int, limit: Optional[int] = None) -> List[DataRecord]:
        """获取所有数据记录"""
        return self.repository.find_all(model_id, limit)
    
    def get_by_id(self, model_id: int, record_id: int) -> Optional[DataRecord]:
        """根据ID获取数据记录"""
        return self.repository.find_by_id(model_id, record_id)
    
    def create(self, model_id: int, data: dict) -> DataRecord:
        """创建数据记录"""
        # 获取属性定义，用于验证
        properties = self.property_repo.find_by_model(model_id)
        
        # 创建DataRecord
        record = DataRecord.from_dict(data, model_id)
        
        # 验证数据
        is_valid, errors = record.validate_against_properties(properties)
        if not is_valid:
            raise ValueError(f"数据验证失败: {', '.join(errors)}")
        
        # 保存
        return self.repository.create(record)
    
    def update(self, model_id: int, record_id: int, data: dict) -> Optional[DataRecord]:
        """更新数据记录"""
        record = self.repository.find_by_id(model_id, record_id)
        if not record:
            return None
        
        # 获取属性定义，用于验证
        properties = self.property_repo.find_by_model(model_id)
        
        # 更新数据
        for key, value in data.items():
            if key not in ["id", "modelId", "createdAt", "updatedAt"]:
                record.set_property_value(key, value)
        
        # 验证数据
        is_valid, errors = record.validate_against_properties(properties)
        if not is_valid:
            raise ValueError(f"数据验证失败: {', '.join(errors)}")
        
        # 保存
        return self.repository.update(record)
    
    def delete(self, model_id: int, record_id: int) -> bool:
        """删除数据记录"""
        return self.repository.delete(model_id, record_id)
