import duckdb
import os

# 数据库路径
DB_PATH = 'c:\\Users\\leon\\Downloads\\trae-build-demo\\backend\\app.data.db'

# 需要添加的缺失模型
MISSING_MODELS = [
    {'code': 'section', 'name': '收费路段', 'description': '收费路段模型'},
    {'code': 'toll_plaza', 'name': '收费广场', 'description': '收费广场模型'}
]

# 主函数
def main():
    print("=== 开始添加缺失的模型 ===")
    
    # 连接数据库
    conn = duckdb.connect(DB_PATH)
    
    # 开始事务
    conn.execute('BEGIN TRANSACTION')
    
    try:
        # 添加每个缺失的模型
        for model in MISSING_MODELS:
            # 检查模型是否已存在
            existing_model = conn.execute('SELECT id FROM models WHERE code = ?', [model['code']]).fetchone()
            if existing_model:
                print(f"   ⚠️  模型 {model['code']} 已存在，跳过")
                continue
            
            # 获取当前最大id值
            max_id_result = conn.execute('SELECT COALESCE(MAX(id), 0) as max_id FROM models').fetchone()
            new_id = max_id_result[0] + 1
            
            # 插入模型
            conn.execute('''
            INSERT INTO models (id, name, code, description)
            VALUES (?, ?, ?, ?)
            ''', [
                new_id,         # id
                model['name'],  # name
                model['code'],  # code
                model['description']  # description
            ])
            
            print(f"   ✅ 已添加模型: {model['code']}")
        
        # 提交事务
        conn.execute('COMMIT')
        print("\n=== 添加完成 ===")
        
    except Exception as e:
        # 回滚事务
        conn.execute('ROLLBACK')
        print(f"\n❌ 添加失败，已回滚事务: {e}")
    finally:
        conn.close()

if __name__ == '__main__':
    main()