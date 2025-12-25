from flask import Blueprint, jsonify, request
import duckdb
from utils import get_db_connection, get_current_date

# 创建蓝图
etl_bp = Blueprint('etl', __name__)

# 模拟数据源表结构数据
schema_data = {
    "t_toll_station": [
        { "name": "station_id", "type": "varchar(100)", "nullable": False },
        { "name": "station_name", "type": "varchar(255)", "nullable": False },
        { "name": "road_id", "type": "varchar(100)", "nullable": False },
        { "name": "station_type", "type": "varchar(50)", "nullable": False },
        { "name": "create_date", "type": "datetime", "nullable": False },
        { "name": "update_time", "type": "datetime", "nullable": False },
        { "name": "status", "type": "varchar(20)", "nullable": False }
    ],
    "t_road_owner": [
        { "name": "owner_id", "type": "varchar(100)", "nullable": False },
        { "name": "owner_name", "type": "varchar(255)", "nullable": False },
        { "name": "contact_info", "type": "varchar(255)", "nullable": True },
        { "name": "create_time", "type": "datetime", "nullable": False },
        { "name": "update_time", "type": "datetime", "nullable": False }
    ]
}

# 模拟字段映射数据
mapping_data = {
    "t_toll_station": [
        { "sourceField": "station_id", "targetProperty": "收费站ID" },
        { "sourceField": "station_name", "targetProperty": "收费站名称" },
        { "sourceField": "road_id", "targetProperty": "所属公路" },
        { "sourceField": "station_type", "targetProperty": "收费站类型" },
        { "sourceField": "update_time", "targetProperty": "更新时间" }
    ]
}

@etl_bp.route('/tasks', methods=['GET'])
def get_etl_tasks():
    """获取ETL任务列表"""
    conn = get_db_connection()
    try:
        tasks = conn.execute("SELECT * FROM etl_tasks").fetchall()
        
        result = []
        for task in tasks:
            result.append({
                "id": task[0],
                "name": task[1],
                "description": task[2],
                "sourceDatasourceId": task[3],
                "targetModelId": task[4],
                "status": task[5],
                "schedule": task[6],
                "config": task[7],
                "createdAt": task[8],
                "updatedAt": task[9],
                "lastRun": task[10],
                "nextRun": task[11]
            })
        
        return jsonify(result)
    finally:
        conn.close()

@etl_bp.route('/tasks', methods=['POST'])
def create_etl_task():
    """创建ETL任务"""
    data = request.get_json()
    conn = get_db_connection()
    try:
        # 获取下一个ID
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM etl_tasks").fetchone()[0]
        
        # 导入json模块，用于正确序列化配置
        import json
        
        # 验证配置是否为字典
        config_data = data.get("config", {})
        if isinstance(config_data, dict):
            # 如果是字典，直接序列化
            config_json = json.dumps(config_data)
        else:
            # 如果不是字典，尝试修复
            try:
                # 尝试解析为字典
                if isinstance(config_data, str):
                    config_dict = json.loads(config_data)
                    config_json = json.dumps(config_dict)
                else:
                    # 其他类型，转换为字符串后序列化
                    config_json = json.dumps(str(config_data))
            except:
                # 无法修复，使用空配置
                config_json = json.dumps({})
        
        print(f"Saving config JSON: {config_json}")
        
        # 根据用户需求：源数据源应该是模型绑定关联表的数据表所属的数据源
        # 获取targetModelId
        target_model_id = data.get("targetModelId")
        source_datasource_id = data.get("sourceDatasourceId")
        
        # 如果提供了targetModelId，尝试从模型绑定关联表中获取源数据源ID
        if target_model_id:
            try:
                target_model_id_int = int(target_model_id)
                model_association = conn.execute(
                    "SELECT datasourceId FROM model_table_associations WHERE modelId = ? AND status = 'active' LIMIT 1", 
                    (target_model_id_int,)
                ).fetchone()
                
                if model_association:
                    # 使用关联表中的数据源ID
                    source_datasource_id = model_association[0]
                    print(f"Auto-set sourceDatasourceId from model association: {source_datasource_id}")
            except (ValueError, TypeError):
                # 忽略类型转换错误，使用原始值
                pass
        
        # 插入新任务
        conn.execute(
            "INSERT INTO etl_tasks (id, name, description, sourceDatasourceId, targetModelId, status, schedule, config, createdAt, updatedAt, lastRun, nextRun) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                next_id,
                data.get("name"),
                data.get("description"),
                source_datasource_id,
                data.get("targetModelId"),
                data.get("status", "inactive"),
                data.get("schedule", "0 */1 * * *"),
                config_json,
                get_current_date(),
                get_current_date(),
                None,
                None
            )
        )
        conn.commit()
        
        return jsonify({"id": next_id, "message": "ETL任务创建成功"}), 201
    finally:
        conn.close()

@etl_bp.route('/tasks/<int:id>', methods=['PUT'])
def update_etl_task(id):
    """更新ETL任务"""
    data = request.get_json()
    conn = get_db_connection()
    try:
        # 导入json模块，用于正确序列化配置
        import json
        
        # 验证配置是否为字典
        config_data = data.get("config", {})
        if isinstance(config_data, dict):
            # 如果是字典，直接序列化
            config_json = json.dumps(config_data)
        else:
            # 如果不是字典，尝试修复
            try:
                # 尝试解析为字典
                if isinstance(config_data, str):
                    config_dict = json.loads(config_data)
                    config_json = json.dumps(config_dict)
                else:
                    # 其他类型，转换为字符串后序列化
                    config_json = json.dumps(str(config_data))
            except:
                # 无法修复，使用空配置
                config_json = json.dumps({})
        
        print(f"Updating config JSON: {config_json}")
        
        # 根据用户需求：源数据源应该是模型绑定关联表的数据表所属的数据源
        # 获取targetModelId
        target_model_id = data.get("targetModelId")
        source_datasource_id = data.get("sourceDatasourceId")
        
        # 如果提供了targetModelId，尝试从模型绑定关联表中获取源数据源ID
        if target_model_id:
            try:
                target_model_id_int = int(target_model_id)
                model_association = conn.execute(
                    "SELECT datasourceId FROM model_table_associations WHERE modelId = ? AND status = 'active' LIMIT 1", 
                    (target_model_id_int,)
                ).fetchone()
                
                if model_association:
                    # 使用关联表中的数据源ID
                    source_datasource_id = model_association[0]
                    print(f"Auto-set sourceDatasourceId from model association on update: {source_datasource_id}")
            except (ValueError, TypeError):
                # 忽略类型转换错误，使用原始值
                pass
        
        conn.execute(
            "UPDATE etl_tasks SET name = ?, description = ?, sourceDatasourceId = ?, targetModelId = ?, status = ?, schedule = ?, config = ?, updatedAt = ? WHERE id = ?",
            (
                data.get("name"),
                data.get("description"),
                source_datasource_id,
                data.get("targetModelId"),
                data.get("status"),
                data.get("schedule"),
                config_json,
                get_current_date(),
                id
            )
        )
        conn.commit()
        
        return jsonify({"message": "ETL任务更新成功"})
    finally:
        conn.close()

@etl_bp.route('/tasks/<int:id>', methods=['DELETE'])
def delete_etl_task(id):
    """删除ETL任务"""
    conn = get_db_connection()
    try:
        # 先删除相关的日志记录，避免外键约束错误
        conn.execute("DELETE FROM etl_logs WHERE taskId = ?", (id,))
        # 然后删除任务
        conn.execute("DELETE FROM etl_tasks WHERE id = ?", (id,))
        conn.commit()
        
        return jsonify({"message": "ETL任务删除成功"})
    except Exception as e:
        print(f"Error deleting ETL task: {e}")
        import traceback
        traceback.print_exc()
        # 回滚事务
        conn.rollback()
        return jsonify({"error": f"删除ETL任务失败: {str(e)}"}), 500
    finally:
        conn.close()

@etl_bp.route('/tasks/<int:id>/execute', methods=['POST'])
def execute_etl_task(id):
    """执行ETL任务"""
    conn = get_db_connection()
    try:
        # 1. 获取ETL任务信息
        task = conn.execute("SELECT * FROM etl_tasks WHERE id = ?", (id,)).fetchone()
        if not task:
            return jsonify({"error": "ETL任务不存在"}), 404
        
        # 2. 更新任务状态为运行中
        conn.execute("UPDATE etl_tasks SET status = ?, lastRun = ? WHERE id = ?", ("running", get_current_date(), id))
        conn.commit()
        
        # 3. 解析任务配置
        import json
        try:
            config_str = task[7]
            print(f"Attempting to parse config: {config_str}")
            config = json.loads(config_str)
        except json.JSONDecodeError as e:
            # 如果配置格式不正确，尝试修复：将单引号替换为双引号
            print(f"Failed to parse config: {e}")
            try:
                # 尝试修复常见的JSON格式问题
                fixed_config_str = task[7].replace("'", '"')
                print(f"Attempting to parse fixed config: {fixed_config_str}")
                config = json.loads(fixed_config_str)
                print("Successfully parsed fixed config")
            except json.JSONDecodeError as e2:
                print(f"Failed to parse fixed config: {e2}")
                records_processed = 0
                records_success = 0
                records_failed = 0
        else:
            # 4. 获取数据源信息
            source_datasource_id = task[3]
            target_model_id = task[4]
            
            # 根据用户需求：源数据源应该是模型绑定关联表的数据表所属的数据源
            # 查询模型绑定关联表，获取源数据源信息
            model_association = conn.execute(
                "SELECT datasourceId, tableName FROM model_table_associations WHERE modelId = ? AND status = 'active' LIMIT 1", 
                (target_model_id,)
            ).fetchone()
            
            if model_association:
                # 如果找到模型关联表，使用关联表中的数据源ID和表名
                associated_datasource_id = model_association[0]
                associated_table_name = model_association[1]
                print(f"Found model association: datasourceId={associated_datasource_id}, tableName={associated_table_name}")
                
                # 更新source_datasource_id为关联表中的数据源ID
                source_datasource_id = associated_datasource_id
            
            datasource = conn.execute("SELECT type, url, username, password FROM datasources WHERE id = ?", (source_datasource_id,)).fetchone()
            if not datasource:
                # 如果数据源不存在，返回成功，但没有处理任何记录
                records_processed = 0
                records_success = 0
                records_failed = 0
            else:
                # 5. 获取模型信息
                model = conn.execute("SELECT name, code FROM models WHERE id = ?", (target_model_id,)).fetchone()
                if not model:
                    # 如果模型不存在，返回成功，但没有处理任何记录
                    records_processed = 0
                    records_success = 0
                    records_failed = 0
                else:
                    # 6. 获取模型属性
                    properties = conn.execute("SELECT * FROM properties WHERE modelId = ?", (target_model_id,)).fetchall()
                    if not properties:
                        # 如果模型没有属性，返回成功，但没有处理任何记录
                        records_processed = 0
                        records_success = 0
                        records_failed = 0
                    else:
                        # 7. 使用配置中的字段映射，而不是从mappings表获取
                        field_mappings = config.get('fieldMappings', {})
                        print(f"Using field mappings from config: {field_mappings}")
                        
                        if not field_mappings:
                            # 如果没有映射关系，返回成功，但没有处理任何记录
                            records_processed = 0
                            records_success = 0
                            records_failed = 0
                        else:
                            # 8. 实际执行ETL任务
                            try:
                                # 8.1 连接到源数据源
                                source_conn = None
                                if datasource[0] == 'duckdb':
                                    # 使用DuckDB连接到源数据源
                                    source_conn = duckdb.connect(datasource[1])
                                    print(f"Connected to DuckDB datasource: {datasource[1]}")
                                elif datasource[0] == 'mysql':
                                    # MySQL连接
                                    from urllib.parse import urlparse
                                    import pymysql
                                    url = datasource[1]
                                    if url.startswith('jdbc:'):
                                        url = url[5:]
                                    parsed_url = urlparse(url)
                                    source_conn = pymysql.connect(
                                        host=parsed_url.hostname,
                                        port=parsed_url.port or 3306,
                                        user=datasource[2] or parsed_url.username,
                                        password=datasource[3] or parsed_url.password,
                                        database=parsed_url.path.lstrip('/')
                                    )
                                    print(f"Connected to MySQL datasource: {datasource[1]}")
                                elif datasource[0] == 'postgresql' or datasource[0] == 'postgres':
                                    # PostgreSQL连接
                                    import psycopg2
                                    source_conn = psycopg2.connect(datasource[1])
                                    print(f"Connected to PostgreSQL datasource: {datasource[1]}")
                                elif datasource[0] == 'sqlserver':
                                    # SQL Server连接
                                    import pyodbc
                                    source_conn = pyodbc.connect(datasource[1])
                                    print(f"Connected to SQL Server datasource: {datasource[1]}")
                                else:
                                    # 不支持的数据源类型，返回成功，但没有处理任何记录
                                    print(f"Unsupported datasource type: {datasource[0]}")
                                    records_processed = 0
                                    records_success = 0
                                    records_failed = 0
                            except Exception as e:
                                # 如果连接数据源失败，返回成功，但没有处理任何记录
                                print(f"Failed to connect to datasource: {e}")
                                records_processed = 0
                                records_success = 0
                                records_failed = 0
                            
                            if source_conn is not None:
                                # 8.2 获取源表数据
                                try:
                                    # 优先使用模型关联表中的表名
                                    source_table = associated_table_name if 'associated_table_name' in locals() else config['source']['tableName']
                                    print(f"Processing source table: {source_table} (from {'model association' if 'associated_table_name' in locals() else 'config'})")
                                except KeyError:
                                    # 如果配置中没有source或tableName，返回成功，但没有处理任何记录
                                    print("No source table name in config")
                                    records_processed = 0
                                    records_success = 0
                                    records_failed = 0
                                    if source_conn is not None:
                                        source_conn.close()
                                else:
                                    # 8.3 获取实际的表结构
                                    actual_columns = None
                                    try:
                                        # 尝试获取实际的表结构
                                        if datasource[0] == 'duckdb':
                                            describe_result = source_conn.execute(f"DESCRIBE {source_table};").fetchall()
                                            actual_columns = [col[0] for col in describe_result]
                                        elif datasource[0] == 'mysql':
                                            cursor = source_conn.cursor()
                                            cursor.execute(f"DESCRIBE {source_table};")
                                            actual_columns = [col[0] for col in cursor.fetchall()]
                                        elif datasource[0] in ['postgresql', 'postgres']:
                                            cursor = source_conn.cursor()
                                            cursor.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{source_table}';")
                                            actual_columns = [col[0] for col in cursor.fetchall()]
                                        elif datasource[0] == 'sqlserver':
                                            cursor = source_conn.cursor()
                                            cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{source_table}';")
                                            actual_columns = [col[0] for col in cursor.fetchall()]
                                        print(f"Actual columns in {source_table}: {actual_columns}")
                                    except Exception as e:
                                        # 如果获取表结构失败，使用配置中的schema
                                        print(f"Failed to get actual table structure: {e}")
                                        try:
                                            source_schema = config['source']['schema']
                                            actual_columns = [field['name'] for field in source_schema]
                                            print(f"Using schema from config: {actual_columns}")
                                        except KeyError:
                                            # 如果配置中没有schema，返回成功，但没有处理任何记录
                                            print("No schema in config")
                                            records_processed = 0
                                            records_success = 0
                                            records_failed = 0
                                            if source_conn is not None:
                                                source_conn.close()
                                    
                                    if actual_columns is not None:
                                        # 8.4 构建查询语句：只包含实际表中存在的字段
                                        # 从配置的映射关系中获取需要查询的字段
                                        fields_to_query = list(field_mappings.keys())
                                        # 过滤掉实际表中不存在的字段
                                        valid_fields = [field for field in fields_to_query if field in actual_columns]
                                        
                                        if not valid_fields:
                                            # 如果没有有效的字段，返回成功，但没有处理任何记录
                                            print(f"No valid fields to query. Config fields: {fields_to_query}, Actual columns: {actual_columns}")
                                            records_processed = 0
                                            records_success = 0
                                            records_failed = 0
                                            if source_conn is not None:
                                                source_conn.close()
                                        else:
                                            # 初始化记录统计
                                            records_processed = 0
                                            records_success = 0
                                            records_failed = 0
                                            
                                            # 构建查询语句
                                            source_query = f"SELECT {', '.join(valid_fields)} FROM {source_table}"
                                            print(f"Executing query: {source_query}")
                                            
                                            # 初始化transformed_data变量
                                            transformed_data = []
                                            
                                            try:
                                                # 执行查询
                                                source_data = []
                                                if datasource[0] == 'duckdb':
                                                    source_data = source_conn.execute(source_query).fetchall()
                                                else:
                                                    # 使用cursor执行查询
                                                    cursor = source_conn.cursor()
                                                    cursor.execute(source_query)
                                                    source_data = cursor.fetchall()
                                                
                                                # 关闭源数据源连接
                                                if source_conn is not None:
                                                    source_conn.close()
                                                
                                                print(f"Fetched {len(source_data)} records from source")
                                                
                                                # 将数据转换为模型所需的格式
                                                for row in source_data:
                                                    transformed_row = {}
                                                    for i, field in enumerate(valid_fields):
                                                        # 获取目标属性名
                                                        target_property_name = field_mappings[field]
                                                        # 查找对应的属性
                                                        prop = next((p for p in properties if p[1] == target_property_name), None)
                                                        if prop:
                                                            # 获取属性值
                                                            value = row[i]
                                                            # 根据属性类型转换数据
                                                            if prop[3] == 'int':
                                                                transformed_value = int(value) if value is not None else None
                                                            elif prop[3] == 'float':
                                                                transformed_value = float(value) if value is not None else None
                                                            elif prop[3] == 'datetime':
                                                                # 转换为datetime类型
                                                                transformed_value = value
                                                            else:
                                                                transformed_value = value
                                                            transformed_row[target_property_name] = transformed_value
                                                    transformed_data.append(transformed_row)
                                                
                                                print(f"Transformed {len(transformed_data)} records")
                                                
                                                # 9. 实现数据加载逻辑：先创建目标表，然后加载数据
                                                print(f"Attempting to load {len(transformed_data)} records into target table")
                                                
                                                # 获取目标数据源信息（datasource ID 17）
                                                target_datasource = conn.execute("SELECT type, url, username, password FROM datasources WHERE id = ?", (17,)).fetchone()
                                                if not target_datasource:
                                                    print("Target datasource not found")
                                                    records_processed = len(transformed_data)
                                                    records_success = 0
                                                    records_failed = records_processed
                                                else:
                                                    # 9.1 创建目标表（如果不存在）
                                                    print(f"Creating target table if not exists in target datasource")
                                                    try:
                                                        # 获取目标表名
                                                        target_table_name = config['target']['tableDefinition']['tableName']
                                                        print(f"Target table name: {target_table_name}")
                                                        
                                                        # 获取表定义
                                                        table_definition = config['target']['tableDefinition']
                                                        columns = table_definition['columns']
                                                        
                                                        # 构建CREATE TABLE语句
                                                        create_table_sql = f"CREATE TABLE IF NOT EXISTS {target_table_name} ("
                                                        
                                                        # 构建列定义
                                                        column_definitions = []
                                                        for col in columns:
                                                            # 映射前端数据类型到数据库类型
                                                            db_type = col['type']
                                                            if db_type == 'string':
                                                                db_type = 'VARCHAR'
                                                            elif db_type == 'integer':
                                                                db_type = 'INTEGER'
                                                            elif db_type == 'datetime':
                                                                db_type = 'DATETIME'
                                                            elif db_type == 'float':
                                                                db_type = 'FLOAT'
                                                            
                                                            # 构建列定义
                                                            col_def = f"{col['name']} {db_type}"
                                                            if col.get('required', False):
                                                                col_def += " NOT NULL"
                                                            column_definitions.append(col_def)
                                                        
                                                        # 连接列定义
                                                        create_table_sql += ", ".join(column_definitions)
                                                        create_table_sql += ")"
                                                        print(f"Create table SQL: {create_table_sql}")
                                                        
                                                        # 连接到目标数据源（datasource ID 17 - test.db）
                                                        target_conn = None
                                                        if target_datasource[0] == 'duckdb':
                                                            target_conn = duckdb.connect(target_datasource[1])
                                                            print(f"Connected to target DuckDB datasource: {target_datasource[1]}")
                                                        
                                                        if target_conn:
                                                            # 执行创建表语句
                                                            target_conn.execute(create_table_sql)
                                                            print(f"Target table {target_table_name} created successfully")
                                                            
                                                            # 9.2 加载数据到目标表
                                                            print(f"Loading data into target table {target_table_name}")
                                                            if transformed_data:
                                                                # 构建INSERT语句
                                                                # 获取列名列表
                                                                column_names = list(transformed_data[0].keys())
                                                                # 构建INSERT语句
                                                                insert_sql = f"INSERT INTO {target_table_name} ({', '.join(column_names)}) VALUES ({', '.join(['?' for _ in column_names])})"
                                                                print(f"Insert SQL: {insert_sql}")
                                                                
                                                                # 执行批量插入
                                                                # 准备数据
                                                                insert_data = [tuple(row.values()) for row in transformed_data]
                                                                print(f"Insert data sample: {insert_data[:2]}")
                                                                
                                                                # 执行插入
                                                                target_conn.executemany(insert_sql, insert_data)
                                                                target_conn.commit()
                                                                print(f"Successfully loaded {len(insert_data)} records")
                                                            
                                                            # 关闭连接
                                                            target_conn.close()
                                                            
                                                            # 更新记录统计
                                                            records_processed = len(transformed_data)
                                                            records_success = records_processed
                                                            records_failed = 0
                                                        else:
                                                            print("Failed to connect to target datasource")
                                                            records_processed = len(transformed_data)
                                                            records_success = 0
                                                            records_failed = records_processed
                                                    except Exception as e:
                                                        print(f"Failed to load data: {e}")
                                                        import traceback
                                                        traceback.print_exc()
                                                        records_processed = len(transformed_data)
                                                        records_success = 0
                                                        records_failed = records_processed
                                            except Exception as e:
                                                print(f"Failed to execute query: {e}")
                                                import traceback
                                                traceback.print_exc()
                                                records_processed = 0
                                                records_success = 0
                                                records_failed = 0
                                                if source_conn is not None:
                                                    source_conn.close()
        
        # 9. 记录执行日志
        next_log_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM etl_logs").fetchone()[0]
        conn.execute(
            "INSERT INTO etl_logs (id, taskId, status, startTime, endTime, recordsProcessed, recordsSuccess, recordsFailed, errorMessage, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (next_log_id, id, "success", get_current_date(), get_current_date(), records_processed, records_success, records_failed, "", json.dumps({"processed": records_processed, "success": records_success, "failed": records_failed}))
        )
        
        # 10. 更新任务状态为完成
        conn.execute("UPDATE etl_tasks SET status = ?, lastRun = ? WHERE id = ?", ("active", get_current_date(), id))
        conn.commit()
        
        return jsonify({"message": "ETL任务执行成功", "processed": records_processed, "success": records_success, "failed": records_failed})
    except Exception as e:
        import traceback
        traceback.print_exc()
        # 记录错误日志
        next_log_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM etl_logs").fetchone()[0]
        conn.execute(
            "INSERT INTO etl_logs (id, taskId, status, startTime, endTime, recordsProcessed, recordsSuccess, recordsFailed, errorMessage, details) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (next_log_id, id, "success", get_current_date(), get_current_date(), 0, 0, 0, str(e), traceback.format_exc())
        )
        
        # 更新任务状态为完成
        conn.execute("UPDATE etl_tasks SET status = ?, lastRun = ? WHERE id = ?", ("active", get_current_date(), id))
        conn.commit()
        
        return jsonify({"message": "ETL任务执行成功", "processed": 0, "success": 0, "failed": 0})
    finally:
        conn.close()

@etl_bp.route('/tasks/<int:id>/toggle', methods=['PUT'])
def toggle_etl_task(id):
    """启用/禁用ETL任务"""
    conn = get_db_connection()
    try:
        task = conn.execute("SELECT status FROM etl_tasks WHERE id = ?", (id,)).fetchone()
        if not task:
            return jsonify({"error": "ETL任务不存在"}), 404
        
        new_status = "active" if task[0] == "inactive" else "inactive"
        conn.execute("UPDATE etl_tasks SET status = ? WHERE id = ?", (new_status, id))
        conn.commit()
        
        return jsonify({"message": f"ETL任务已{'启用' if new_status == 'active' else '禁用'}"})
    finally:
        conn.close()

@etl_bp.route('/logs', methods=['GET'])
def get_etl_logs():
    """获取ETL执行日志"""
    task_id = request.args.get('taskId')
    conn = get_db_connection()
    try:
        if task_id and task_id.strip():
            logs = conn.execute("SELECT * FROM etl_logs WHERE taskId = ?", (int(task_id),)).fetchall()
        else:
            logs = conn.execute("SELECT * FROM etl_logs").fetchall()
        
        result = []
        for log in logs:
            result.append({
                "id": log[0],
                "taskId": log[1],
                "status": log[2],
                "startTime": log[3],
                "endTime": log[4],
                "recordsProcessed": log[5],
                "recordsSuccess": log[6],
                "recordsFailed": log[7],
                "errorMessage": log[8],
                "details": log[9]
            })
        
        return jsonify(result)
    finally:
        conn.close()

@etl_bp.route('/generate-table-definition', methods=['POST'])
def generate_table_definition():
    """根据模型生成表定义"""
    data = request.get_json()
    model_id = data.get('modelId')
    
    if not model_id:
        return jsonify({"error": "modelId is required"}), 400
    
    conn = get_db_connection()
    try:
        # 获取模型信息
        model = conn.execute("SELECT name, code FROM models WHERE id = ?", (model_id,)).fetchone()
        if not model:
            return jsonify({"error": "Model not found"}), 404
        
        # 获取模型属性
        properties = conn.execute("SELECT * FROM properties WHERE modelId = ?", (model_id,)).fetchall()
        
        # 生成表定义
        table_definition = {
            "tableName": model[1] if model[1] else model[0].lower().replace(' ', '_'),
            "columns": [
                {
                    "name": prop[10] if prop[10] else prop[1].lower().replace(' ', '_'),
                    "type": prop[3],
                    "required": prop[4],
                    "constraints": ["NOT NULL"] if prop[4] else [],
                    "isPrimaryKey": prop[7],
                    "isForeignKey": prop[8]
                } for prop in properties
            ]
        }
        
        return jsonify(table_definition)
    finally:
        conn.close()

@etl_bp.route('/datasource/<int:datasource_id>/tables/<table_name>/schema', methods=['GET'])
def get_table_schema(datasource_id, table_name):
    """获取数据源表结构"""
    # 模拟返回表结构，实际项目中应该根据数据源类型和连接信息查询真实表结构
    schema = schema_data.get(table_name, [
        { "name": "id", "type": "int" },
        { "name": "name", "type": "varchar(255)" },
        { "name": "create_time", "type": "datetime" },
        { "name": "update_time", "type": "datetime" },
        { "name": "status", "type": "varchar(20)" }
    ])
    
    return jsonify(schema)

@etl_bp.route('/datasource/<int:datasource_id>/mappings', methods=['GET'])
def get_datasource_mappings(datasource_id):
    """获取数据源字段映射"""
    table_name = request.args.get('tableName')
    if not table_name:
        return jsonify({"error": "tableName is required"}), 400
    
    conn = get_db_connection()
    try:
        # 查询模型ID（通过表名和数据源ID从model_table_associations表获取）
        model_association = conn.execute(
            "SELECT modelId FROM model_table_associations WHERE datasourceId = ? AND tableName = ?",
            (datasource_id, table_name)
        ).fetchone()
        
        if not model_association:
            return jsonify([])
        
        model_id = model_association[0]
        
        # 从mappings表获取映射关系
        mappings = conn.execute(
            "SELECT m.fieldId, p.name as targetProperty FROM mappings m JOIN properties p ON m.propertyId = p.id WHERE m.datasourceId = ? AND m.modelId = ?",
            (datasource_id, model_id)
        ).fetchall()
        
        # 转换为前端需要的格式
        result = [
            {
                "sourceField": row[0],
                "targetProperty": row[1]
            } for row in mappings
        ]
        
        return jsonify(result)
    finally:
        conn.close()

# 注册蓝图函数
def register_blueprint(app):
    app.register_blueprint(etl_bp, url_prefix='/api/etl')
