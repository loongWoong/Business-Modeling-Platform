"""
Model聚合
包含：Model（聚合根）、Property（实体）、Relation（实体）
"""
from .model import Model
from .property import Property
from .relation import Relation

__all__ = ['Model', 'Property', 'Relation']

