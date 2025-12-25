from utils import get_db_connection

# 获取数据库连接
conn = get_db_connection()

# 查询properties表结构
describe_result = conn.execute("DESCRIBE properties;").fetchall()
print("Properties table structure:")
for i, col in enumerate(describe_result):
    print(f"{i}: {col}")

# 查询一条properties表数据，了解实际数据结构
sample_data = conn.execute("SELECT * FROM properties LIMIT 1;").fetchall()
print("\nSample properties data:")
if sample_data:
    for i, value in enumerate(sample_data[0]):
        print(f"{i}: {describe_result[i][0]} = {value}")

# 关闭连接
conn.close()