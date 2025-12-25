from utils import get_db_connection

# 获取数据库连接
conn = get_db_connection()

try:
    # 查看插入后的指标数据
    print("=== 插入后的指标数据 ===")
    all_indicators = conn.execute("SELECT * FROM indicators ORDER BY id;")
    rows = all_indicators.fetchall()
    
    print(f"总共插入 {len(rows)} 个指标")
    for row in rows:
        print(f"ID: {row[0]}, 名称: {row[1]}, 表达式: {row[2]}, 类型: {row[3]}, 单位: {row[4]}, 状态: {row[6]}")
        
finally:
    conn.close()