import duckdb
import os

# 获取数据库路径
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, 'app.data.db')

# 连接到数据库
conn = duckdb.connect(db_path)
cursor = conn.cursor()

# 创建etl_tasks表
try:
    cursor.execute('''
    CREATE TABLE etl_tasks (
        id INTEGER PRIMARY KEY,
        name VARCHAR,
        description VARCHAR,
        sourceDatasourceId INTEGER,
        targetModelId INTEGER,
        status VARCHAR,
        schedule VARCHAR,
        config VARCHAR,
        createdAt DATE,
        updatedAt DATE,
        lastRun DATE,
        nextRun DATE
    )
    ''')
    print("etl_tasks table created successfully")
except Exception as e:
    print(f"Error creating etl_tasks table: {e}")

# 创建etl_logs表
try:
    cursor.execute('''
    CREATE TABLE etl_logs (
        id INTEGER PRIMARY KEY,
        taskId INTEGER,
        status VARCHAR,
        startTime DATE,
        endTime DATE,
        recordsProcessed INTEGER,
        recordsSuccess INTEGER,
        recordsFailed INTEGER,
        errorMessage VARCHAR,
        details VARCHAR
    )
    ''')
    print("etl_logs table created successfully")
except Exception as e:
    print(f"Error creating etl_logs table: {e}")

# 关闭连接
conn.close()
