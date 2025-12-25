from utils import get_db_connection

# 获取数据库连接
conn = get_db_connection()

try:
    # 查看indicators表结构
    print("=== indicators表结构 ===")
    describe_result = conn.execute("DESCRIBE indicators;").fetchall()
    for i, col in enumerate(describe_result):
        print(f"{i}: {col}")
    
    # 查看表中现有数据
    print("\n=== indicators表现有数据 ===")
    existing_data = conn.execute("SELECT * FROM indicators;").fetchall()
    if existing_data:
        print(f"现有记录数: {len(existing_data)}")
        for row in existing_data:
            print(row)
    else:
        print("表中无数据")
        
finally:
    conn.close()