"""
ETL聚合
包含：ETLTask（聚合根）、ETLLog（实体）
"""
from .etl_task import ETLTask
from .etl_log import ETLLog

__all__ = ['ETLTask', 'ETLLog']

