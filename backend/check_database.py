from utils import get_db_connection

# 获取数据库连接
conn = get_db_connection()

try:
    # 检查各个表的结构和数据
    tables_to_check = [
        'domains',
        'domain_edges',
        'shared_attributes',
        'models',
        'model_edges',
        'relations',
        'indicators',
        'model_indicators'
    ]
    
    for table in tables_to_check:
        print(f"\n=== {table} 表信息 ===")
        
        # 检查表是否存在
        try:
            conn.execute(f"DESCRIBE {table};")
            print(f"表 {table} 存在")
            
            # 查询表结构
            describe_result = conn.execute(f"DESCRIBE {table};")
            print(f"表结构:")
            for i, col in enumerate(describe_result.fetchall()):
                print(f"  {i}: {col}")
            
            # 查询表数据
            count = conn.execute(f"SELECT COUNT(*) FROM {table};").fetchone()[0]
            print(f"表数据行数: {count}")
            
            # 如果数据行数小于10，显示所有数据
            if count > 0 and count < 10:
                data = conn.execute(f"SELECT * FROM {table};")
                print(f"表数据:")
                for row in data.fetchall():
                    print(f"  {row}")
            elif count >= 10:
                # 只显示前5行
                data = conn.execute(f"SELECT * FROM {table} LIMIT 5;")
                print(f"表数据前5行:")
                for row in data.fetchall():
                    print(f"  {row}")
        except Exception as e:
            print(f"表 {table} 不存在或查询失败: {e}")
            continue
            
finally:
    # 关闭连接
    conn.close()