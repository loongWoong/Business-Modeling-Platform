"""
基础仓储接口
定义聚合根的持久化操作
"""
from abc import ABC, abstractmethod
from typing import Optional, List, TypeVar, Generic

T = TypeVar('T')


class IRepository(ABC, Generic[T]):
    """仓储接口"""
    
    @abstractmethod
    def find_by_id(self, id: int) -> Optional[T]:
        """根据ID查找聚合根"""
        pass
    
    @abstractmethod
    def find_all(self, filters: Optional[dict] = None) -> List[T]:
        """查找所有聚合根"""
        pass
    
    @abstractmethod
    def save(self, aggregate: T) -> T:
        """保存聚合根（创建或更新）"""
        pass
    
    @abstractmethod
    def delete(self, id: int) -> bool:
        """删除聚合根"""
        pass

