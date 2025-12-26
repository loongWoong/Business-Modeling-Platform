"""
数据库连接工具
"""
from datetime import datetime
import os
import duckdb

# 获取当前脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))
# 定义数据库路径（使用backend_ddd目录下的数据库）
DB_PATH = os.path.join(script_dir, '..', '..', 'app.data.db')


def get_db_connection():
    """获取数据库连接"""
    conn = duckdb.connect(DB_PATH)
    return conn


def get_current_date():
    """获取当前日期"""
    return datetime.now().strftime("%Y-%m-%d")

