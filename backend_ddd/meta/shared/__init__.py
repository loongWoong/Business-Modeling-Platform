"""
共享领域模型
包含：Domain（分类维度）、Relation（跨聚合关系）、Mapping（跨聚合映射）
"""
from .domain import Domain
from .relation import Relation
from .mapping import Mapping

__all__ = ['Domain', 'Relation', 'Mapping']
