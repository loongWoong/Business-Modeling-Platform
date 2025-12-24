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
def test_database_connection(datasource_type, url):
    """
    测试数据库连接
    :param datasource_type: 数据源类型（mysql, postgresql, sqlserver等）
    :param url: 数据库连接URL
    :return: tuple (success, message)
    """
    try:
        if datasource_type == 'mysql':
            # MySQL连接URL格式：mysql://username:password@host:port/database
            from urllib.parse import urlparse
            parsed_url = urlparse(url)
            conn = pymysql.connect(
                host=parsed_url.hostname,
                port=parsed_url.port or 3306,
                user=parsed_url.username,
                password=parsed_url.password,
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
def get_database_tables(datasource_type, url):
    """
    获取数据库中的表列表
    :param datasource_type: 数据源类型（mysql, postgresql, sqlserver等）
    :param url: 数据库连接URL
    :return: tuple (success, tables or message)
    """
    try:
        tables = []
        if datasource_type == 'mysql':
            # MySQL连接URL格式：mysql://username:password@host:port/database
            from urllib.parse import urlparse
            parsed_url = urlparse(url)
            conn = pymysql.connect(
                host=parsed_url.hostname,
                port=parsed_url.port or 3306,
                user=parsed_url.username,
                password=parsed_url.password,
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
