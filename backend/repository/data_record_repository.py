"""
DataRecord Repository
DataRecord存储在实际数据源中，不是元数据数据库
"""
from typing import Optional, List, Dict, Any
import duckdb
import pymysql
import psycopg2
import pyodbc
from urllib.parse import urlparse
from repository.model_repository import ModelRepository
from repository.property_repository import PropertyRepository
from repository.datasource_repository import DatasourceRepository
from repository.model_table_association_repository import ModelTableAssociationRepository
from meta.data_record import DataRecord
from utils import get_db_connection, get_current_date


class DataRecordRepository:
    """DataRecord持久化层 - 操作实际数据源"""
    
    def __init__(self):
        self.model_repo = ModelRepository()
        self.property_repo = PropertyRepository()
        self.datasource_repo = DatasourceRepository()
        self.association_repo = ModelTableAssociationRepository()
    
    def _get_target_datasource(self, model_id: int) -> Optional[tuple]:
        """获取目标数据源信息"""
        conn = get_db_connection()
        try:
            # 优先从model_table_associations获取
            associations = self.association_repo.find_by_model(model_id)
            if associations:
                active_assoc = next((a for a in associations if a.status == 'active'), None)
                if active_assoc:
                    datasource = self.datasource_repo.find_by_id(active_assoc.datasourceId)
                    if datasource:
                        return datasource, active_assoc.tableName
            
            # 如果没有关联，从全局配置获取
            global_config = conn.execute(
                "SELECT value FROM configs WHERE key = ?",
                ('global_target_datasource_id',)
            ).fetchone()
            
            if global_config and global_config[0]:
                datasource_id = int(global_config[0])
                datasource = self.datasource_repo.find_by_id(datasource_id)
                if datasource:
                    # 使用模型code作为表名
                    model = self.model_repo.find_by_id(model_id)
                    if model:
                        return datasource, model.code
            
            return None
        finally:
            conn.close()
    
    def _get_external_connection(self, datasource):
        """获取外部数据源连接"""
        if datasource.type == 'duckdb':
            return duckdb.connect(datasource.url)
        elif datasource.type == 'mysql':
            parsed_url = urlparse(datasource.url.replace('jdbc:', ''))
            return pymysql.connect(
                host=parsed_url.hostname,
                port=parsed_url.port or 3306,
                user=datasource.username or parsed_url.username,
                password=datasource.password or parsed_url.password,
                database=parsed_url.path.lstrip('/')
            )
        elif datasource.type in ['postgresql', 'postgres']:
            return psycopg2.connect(datasource.url)
        elif datasource.type == 'sqlserver':
            return pyodbc.connect(datasource.url)
        else:
            raise ValueError(f"不支持的数据源类型: {datasource.type}")
    
    def find_all(self, model_id: int, limit: Optional[int] = None) -> List[DataRecord]:
        """查找所有数据记录"""
        datasource_info = self._get_target_datasource(model_id)
        if not datasource_info:
            return []
        
        datasource, table_name = datasource_info
        external_conn = None
        
        try:
            external_conn = self._get_external_connection(datasource)
            
            # 查询数据
            limit_clause = f" LIMIT {limit}" if limit else ""
            result = external_conn.execute(f"SELECT * FROM {table_name}{limit_clause}").fetchall()
            
            # 获取列名
            if datasource.type == 'duckdb':
                columns = [desc[0] for desc in external_conn.execute(f"DESCRIBE {table_name}").fetchall()]
            else:
                # 其他数据库类型
                columns = [desc[0] for desc in external_conn.cursor().description] if result else []
            
            # 转换为DataRecord
            records = []
            for row in result:
                row_dict = dict(zip(columns, row))
                record = DataRecord.from_dict(row_dict, model_id)
                records.append(record)
            
            return records
        finally:
            if external_conn:
                external_conn.close()
    
    def find_by_id(self, model_id: int, record_id: int) -> Optional[DataRecord]:
        """根据ID查找数据记录"""
        datasource_info = self._get_target_datasource(model_id)
        if not datasource_info:
            return None
        
        datasource, table_name = datasource_info
        external_conn = None
        
        try:
            external_conn = self._get_external_connection(datasource)
            
            # 查询单条记录（假设id是主键）
            result = external_conn.execute(
                f"SELECT * FROM {table_name} WHERE id = ?",
                (record_id,)
            ).fetchone()
            
            if not result:
                return None
            
            # 获取列名
            if datasource.type == 'duckdb':
                columns = [desc[0] for desc in external_conn.execute(f"DESCRIBE {table_name}").fetchall()]
            else:
                columns = [desc[0] for desc in external_conn.cursor().description]
            
            row_dict = dict(zip(columns, result))
            return DataRecord.from_dict(row_dict, model_id)
        finally:
            if external_conn:
                external_conn.close()
    
    def create(self, record: DataRecord) -> DataRecord:
        """创建数据记录"""
        datasource_info = self._get_target_datasource(record.modelId)
        if not datasource_info:
            raise ValueError("无法找到目标数据源")
        
        datasource, table_name = datasource_info
        external_conn = None
        
        try:
            external_conn = self._get_external_connection(datasource)
            
            # 获取属性信息，确定列名
            properties = self.property_repo.find_by_model(record.modelId)
            columns = [prop.physicalColumn or prop.code for prop in properties]
            
            # 构建插入语句
            values = [record.data.get(prop.code) for prop in properties]
            placeholders = ','.join(['?'] * len(columns))
            column_names = ','.join(columns)
            
            external_conn.execute(
                f"INSERT INTO {table_name} ({column_names}) VALUES ({placeholders})",
                tuple(values)
            )
            
            # 获取插入的ID（如果数据库支持）
            # 注意：需要表有自增ID列
            try:
                if datasource.type == 'duckdb':
                    # DuckDB使用LAST_INSERT_ROWID()
                    last_id = external_conn.execute("SELECT LAST_INSERT_ROWID()").fetchone()[0]
                    record.id = last_id
                elif datasource.type == 'mysql':
                    # MySQL使用LAST_INSERT_ID()
                    last_id = external_conn.cursor().lastrowid
                    if last_id:
                        record.id = last_id
                # 其他数据库类型类似处理
            except:
                # 如果无法获取ID，保持原有ID或使用data中的id
                pass
            
            return record
        finally:
            if external_conn:
                external_conn.close()
    
    def update(self, record: DataRecord) -> DataRecord:
        """更新数据记录"""
        datasource_info = self._get_target_datasource(record.modelId)
        if not datasource_info:
            raise ValueError("无法找到目标数据源")
        
        datasource, table_name = datasource_info
        external_conn = None
        
        try:
            external_conn = self._get_external_connection(datasource)
            
            # 获取属性信息
            properties = self.property_repo.find_by_model(record.modelId)
            
            # 构建更新语句
            set_clauses = []
            values = []
            for prop in properties:
                column = prop.physicalColumn or prop.code
                value = record.data.get(prop.code)
                set_clauses.append(f"{column} = ?")
                values.append(value)
            
            values.append(record.id)
            set_clause = ','.join(set_clauses)
            
            external_conn.execute(
                f"UPDATE {table_name} SET {set_clause} WHERE id = ?",
                tuple(values)
            )
            
            record.updatedAt = get_current_date()
            return record
        finally:
            if external_conn:
                external_conn.close()
    
    def delete(self, model_id: int, record_id: int) -> bool:
        """删除数据记录"""
        datasource_info = self._get_target_datasource(model_id)
        if not datasource_info:
            return False
        
        datasource, table_name = datasource_info
        external_conn = None
        
        try:
            external_conn = self._get_external_connection(datasource)
            result = external_conn.execute(
                f"DELETE FROM {table_name} WHERE id = ?",
                (record_id,)
            )
            return result.rowcount > 0
        finally:
            if external_conn:
                external_conn.close()
