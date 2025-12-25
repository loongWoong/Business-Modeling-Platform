import duckdb
import os

# 获取当前脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))
# 定义数据库路径
DB_PATH = os.path.join(script_dir, 'app.data.db')

# 获取数据库连接
conn = duckdb.connect(DB_PATH)
cursor = conn.cursor()

# 检查mappings表结构
try:
    cursor.execute('DESCRIBE mappings')
    print('Mappings table structure:')
    print(cursor.fetchall())
except Exception as e:
    print(f'Error describing mappings table: {e}')

# 检查mappings表数据
try:
    cursor.execute('SELECT * FROM mappings LIMIT 10')
    print('\nMappings table data:')
    print(cursor.fetchall())
except Exception as e:
    print(f'Error reading mappings table: {e}')

# 检查properties表结构
try:
    cursor.execute('DESCRIBE properties')
    print('\nProperties table structure:')
    print(cursor.fetchall())
except Exception as e:
    print(f'Error describing properties table: {e}')

# 检查properties表数据
try:
    cursor.execute('SELECT id, name, code, modelId FROM properties LIMIT 10')
    print('\nProperties table data:')
    print(cursor.fetchall())
except Exception as e:
    print(f'Error reading properties table: {e}')

# 检查model_table_associations表结构
try:
    cursor.execute('DESCRIBE model_table_associations')
    print('\nModel_table_associations table structure:')
    print(cursor.fetchall())
except Exception as e:
    print(f'Error describing model_table_associations table: {e}')

# 检查model_table_associations表数据
try:
    cursor.execute('SELECT * FROM model_table_associations LIMIT 10')
    print('\nModel_table_associations table data:')
    print(cursor.fetchall())
except Exception as e:
    print(f'Error reading model_table_associations table: {e}')

# 关闭连接
conn.close()