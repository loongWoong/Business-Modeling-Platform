from datetime import datetime
import os
import duckdb
import pymysql
import psycopg2
import pyodbc

# 获取当前脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))

# 定义数据库路径
DB_PATH = os.path.join(script_dir, 'app.data.db')

# 获取数据库连接
def get_db_connection():
    conn = duckdb.connect(DB_PATH)
    return conn

# 获取当前日期
def get_current_date():
    return datetime.now().strftime("%Y-%m-%d")

# 获取下一个ID
def get_next_id(data_list):
    if not data_list:
        return 1
    return max(item["id"] for item in data_list) + 1

# 根据ID获取模型名称
def get_model_name_by_id(model_id, mock_data):
    for model in mock_data["models"]:
        if model["id"] == model_id:
            return model["name"]
    return None

# 根据名称获取模型ID
def get_model_id_by_name(model_name, mock_data):
    for model in mock_data["models"]:
        if model["name"] == model_name:
            return model["id"]
    return None

# 测试数据库连接
def test_database_connection(datasource_type, url, username=None, password=None):
    """
    测试数据库连接
    :param datasource_type: 数据源类型（mysql, postgresql, sqlserver等）
    :param url: 数据库连接URL
    :param username: 数据库用户名（可选）
    :param password: 数据库密码（可选）
    :return: tuple (success, message)
    """
    try:
        if datasource_type == 'mysql':
            # MySQL连接URL格式：jdbc:mysql://host:port/database 或 mysql://host:port/database
            from urllib.parse import urlparse
            # 处理jdbc前缀
            if url.startswith('jdbc:'):
                url = url[5:]
            parsed_url = urlparse(url)
            conn = pymysql.connect(
                host=parsed_url.hostname,
                port=parsed_url.port or 3306,
                user=username or parsed_url.username,
                password=password or parsed_url.password,
                database=parsed_url.path.lstrip('/')
            )
            conn.close()
        elif datasource_type == 'postgresql' or datasource_type == 'postgres':
            # PostgreSQL连接URL格式：postgresql://username:password@host:port/database
            conn = psycopg2.connect(url)
            conn.close()
        elif datasource_type == 'sqlserver':
            # SQL Server连接URL格式：mssql://username:password@host:port/database
            conn = pyodbc.connect(url)
            conn.close()
        elif datasource_type == 'duckdb':
            # DuckDB连接URL格式：duckdb:///path/to/database.db 或 duckdb://memory
            conn = duckdb.connect(url.replace('duckdb://', ''))
            conn.close()
        else:
            return False, f"不支持的数据源类型: {datasource_type}"
        return True, "连接测试成功"
    except Exception as e:
        return False, f"连接测试失败: {str(e)}"

# 获取数据库表列表
def get_database_tables(datasource_type, url, username=None, password=None):
    """
    获取数据库中的表列表
    :param datasource_type: 数据源类型（mysql, postgresql, sqlserver等）
    :param url: 数据库连接URL
    :param username: 数据库用户名（可选）
    :param password: 数据库密码（可选）
    :return: tuple (success, tables or message)
    """
    try:
        tables = []
        if datasource_type == 'mysql':
            # MySQL连接URL格式：jdbc:mysql://host:port/database 或 mysql://host:port/database
            from urllib.parse import urlparse
            # 处理jdbc前缀
            if url.startswith('jdbc:'):
                url = url[5:]
            parsed_url = urlparse(url)
            conn = pymysql.connect(
                host=parsed_url.hostname,
                port=parsed_url.port or 3306,
                user=username or parsed_url.username,
                password=password or parsed_url.password,
                database=parsed_url.path.lstrip('/')
            )
            with conn.cursor() as cursor:
                cursor.execute("SHOW TABLES")
                tables = [table[0] for table in cursor.fetchall()]
            conn.close()
        elif datasource_type == 'postgresql' or datasource_type == 'postgres':
            # PostgreSQL连接URL格式：postgresql://username:password@host:port/database
            conn = psycopg2.connect(url)
            with conn.cursor() as cursor:
                cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'")
                tables = [table[0] for table in cursor.fetchall()]
            conn.close()
        elif datasource_type == 'sqlserver':
            # SQL Server连接URL格式：mssql://username:password@host:port/database
            conn = pyodbc.connect(url)
            with conn.cursor() as cursor:
                cursor.execute("SELECT name FROM sys.tables")
                tables = [table[0] for table in cursor.fetchall()]
            conn.close()
        elif datasource_type == 'duckdb':
            # DuckDB连接URL格式：duckdb:///path/to/database.db 或 duckdb://memory
            conn = duckdb.connect(url.replace('duckdb://', ''))
            cursor = conn.cursor()
            # 查询DuckDB中的表列表
            cursor.execute("SHOW TABLES")
            tables = [table[0] for table in cursor.fetchall()]
            conn.close()
        else:
            return False, f"不支持的数据源类型: {datasource_type}"
        return True, tables
    except Exception as e:
        return False, f"获取表列表失败: {str(e)}"

# 获取数据库表结构
def get_database_table_schema(datasource_type, url, table_name, username=None, password=None):
    """
    获取数据库表结构
    :param datasource_type: 数据源类型（mysql, postgresql, sqlserver等）
    :param url: 数据库连接URL
    :param table_name: 表名
    :param username: 数据库用户名（可选）
    :param password: 数据库密码（可选）
    :return: tuple (success, schema or message)
    """
    try:
        fields = []
        if datasource_type == 'mysql':
            # MySQL连接URL格式：jdbc:mysql://host:port/database 或 mysql://host:port/database
            from urllib.parse import urlparse
            # 处理jdbc前缀
            if url.startswith('jdbc:'):
                url = url[5:]
            parsed_url = urlparse(url)
            conn = pymysql.connect(
                host=parsed_url.hostname,
                port=parsed_url.port or 3306,
                user=username or parsed_url.username,
                password=password or parsed_url.password,
                database=parsed_url.path.lstrip('/')
            )
            with conn.cursor() as cursor:
                # 获取列信息
                cursor.execute(f"DESCRIBE {table_name}")
                columns = cursor.fetchall()
                # 获取主键信息
                cursor.execute(f"SHOW KEYS FROM {table_name} WHERE Key_name = 'PRIMARY'")
                primary_keys = {row[4] for row in cursor.fetchall()}
                # 获取外键信息
                cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE TABLE_NAME = '{table_name}' AND CONSTRAINT_NAME != 'PRIMARY' AND REFERENCED_TABLE_NAME IS NOT NULL")
                foreign_keys = {row[0] for row in cursor.fetchall()}
                
                for col in columns:
                    col_name = col[0]
                    fields.append({
                        "column_name": col_name,
                        "data_type": col[1],
                        "is_primary_key": col_name in primary_keys,
                        "is_foreign_key": col_name in foreign_keys,
                        "nullable": col[2] == 'YES'
                    })
            conn.close()
        elif datasource_type == 'postgresql' or datasource_type == 'postgres':
            # PostgreSQL连接URL格式：postgresql://username:password@host:port/database
            conn = psycopg2.connect(url)
            with conn.cursor() as cursor:
                # 获取列基本信息
                cursor.execute(f"SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = '{table_name}'")
                columns = cursor.fetchall()
                # 获取主键信息
                cursor.execute(f"SELECT a.attname FROM pg_index i JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey) WHERE i.indrelid = '{table_name}'::regclass AND i.indisprimary")
                primary_keys = {row[0] for row in cursor.fetchall()}
                # 获取外键信息
                cursor.execute(f"SELECT kcu.column_name FROM information_schema.table_constraints tc JOIN information_schema.key_column_usage kcu ON tc.constraint_name = kcu.constraint_name WHERE tc.table_name = '{table_name}' AND tc.constraint_type = 'FOREIGN KEY'")
                foreign_keys = {row[0] for row in cursor.fetchall()}
                
                for col in columns:
                    col_name = col[0]
                    fields.append({
                        "column_name": col_name,
                        "data_type": col[1],
                        "is_primary_key": col_name in primary_keys,
                        "is_foreign_key": col_name in foreign_keys,
                        "nullable": col[2] == 'YES'
                    })
            conn.close()
        elif datasource_type == 'sqlserver':
            # SQL Server连接URL格式：mssql://username:password@host:port/database
            conn = pyodbc.connect(url)
            with conn.cursor() as cursor:
                # 获取列基本信息
                cursor.execute(f"SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '{table_name}'")
                columns = cursor.fetchall()
                # 获取主键信息
                cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsPrimaryKey') = 1 AND TABLE_NAME = '{table_name}'")
                primary_keys = {row[0] for row in cursor.fetchall()}
                # 获取外键信息
                cursor.execute(f"SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE WHERE OBJECTPROPERTY(OBJECT_ID(CONSTRAINT_SCHEMA + '.' + CONSTRAINT_NAME), 'IsForeignKey') = 1 AND TABLE_NAME = '{table_name}'")
                foreign_keys = {row[0] for row in cursor.fetchall()}
                
                for col in columns:
                    col_name = col[0]
                    fields.append({
                        "column_name": col_name,
                        "data_type": col[1],
                        "is_primary_key": col_name in primary_keys,
                        "is_foreign_key": col_name in foreign_keys,
                        "nullable": col[2] == 'YES'
                    })
            conn.close()
        elif datasource_type == 'duckdb':
            # DuckDB连接URL格式：duckdb:///path/to/database.db 或 duckdb://memory
            conn = duckdb.connect(url.replace('duckdb://', ''))
            cursor = conn.cursor()
            # 查询表结构
            cursor.execute(f"DESCRIBE {table_name}")
            columns = cursor.fetchall()
            # 查询主键信息（DuckDB 0.7.0+支持）
            primary_keys = set()
            try:
                cursor.execute(f"SELECT column_name FROM duckdb_constraints WHERE table_name = '{table_name}' AND constraint_type = 'PRIMARY KEY'")
                primary_keys = {row[0] for row in cursor.fetchall()}
            except:
                pass
            # 查询外键信息（DuckDB 0.7.0+支持）
            foreign_keys = set()
            try:
                cursor.execute(f"SELECT column_name FROM duckdb_constraints WHERE table_name = '{table_name}' AND constraint_type = 'FOREIGN KEY'")
                foreign_keys = {row[0] for row in cursor.fetchall()}
            except:
                pass
            
            for col in columns:
                col_name = col[0]
                fields.append({
                    "column_name": col_name,
                    "data_type": col[1],
                    "is_primary_key": col_name in primary_keys,
                    "is_foreign_key": col_name in foreign_keys,
                    "nullable": col[2] == 'YES'
                })
            conn.close()
        else:
            return False, f"不支持的数据源类型: {datasource_type}"
        return True, {"fields": fields}
    except Exception as e:
        return False, f"获取表结构失败: {str(e)}"

# 获取数据库表数据
def get_database_table_data(datasource_type, url, table_name, username=None, password=None, limit=100):
    """
    获取数据库表数据
    :param datasource_type: 数据源类型（mysql, postgresql, sqlserver等）
    :param url: 数据库连接URL
    :param table_name: 表名
    :param username: 数据库用户名（可选）
    :param password: 数据库密码（可选）
    :param limit: 返回数据条数限制，默认100条
    :return: tuple (success, data or message)
    """
    try:
        data = []
        if datasource_type == 'mysql':
            # MySQL连接URL格式：jdbc:mysql://host:port/database 或 mysql://host:port/database
            from urllib.parse import urlparse
            # 处理jdbc前缀
            if url.startswith('jdbc:'):
                url = url[5:]
            parsed_url = urlparse(url)
            conn = pymysql.connect(
                host=parsed_url.hostname,
                port=parsed_url.port or 3306,
                user=username or parsed_url.username,
                password=password or parsed_url.password,
                database=parsed_url.path.lstrip('/')
            )
            with conn.cursor(pymysql.cursors.DictCursor) as cursor:
                cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit}")
                data = cursor.fetchall()
            conn.close()
        elif datasource_type == 'postgresql' or datasource_type == 'postgres':
            # PostgreSQL连接URL格式：postgresql://username:password@host:port/database
            conn = psycopg2.connect(url)
            with conn.cursor() as cursor:
                cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit}")
                columns = [desc[0] for desc in cursor.description]
                rows = cursor.fetchall()
                data = [dict(zip(columns, row)) for row in rows]
            conn.close()
        elif datasource_type == 'sqlserver':
            # SQL Server连接URL格式：mssql://username:password@host:port/database
            conn = pyodbc.connect(url)
            with conn.cursor() as cursor:
                cursor.execute(f"SELECT TOP {limit} * FROM {table_name}")
                columns = [column[0] for column in cursor.description]
                rows = cursor.fetchall()
                data = [dict(zip(columns, row)) for row in rows]
            conn.close()
        elif datasource_type == 'duckdb':
            # DuckDB连接URL格式：duckdb:///path/to/database.db 或 duckdb://memory
            conn = duckdb.connect(url.replace('duckdb://', ''))
            cursor = conn.cursor()
            cursor.execute(f"SELECT * FROM {table_name} LIMIT {limit}")
            data = cursor.fetchdf().to_dict('records')
            conn.close()
        else:
            return False, f"不支持的数据源类型: {datasource_type}"
        return True, data
    except Exception as e:
        return False, f"获取表数据失败: {str(e)}"
