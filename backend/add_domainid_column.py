import duckdb
import os

# 获取当前脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))

# 定义数据库路径
DB_PATH = os.path.join(script_dir, 'app.data.db')

def add_domainid_column():
    """在datasources表中添加domainId字段"""
    conn = duckdb.connect(DB_PATH)
    try:
        # 检查是否已经存在domainId字段
        columns = conn.execute("PRAGMA table_info(datasources)").fetchall()
        has_domainid = any(col[1] == 'domainId' for col in columns)
        
        if not has_domainid:
            # 添加domainId字段
            conn.execute("ALTER TABLE datasources ADD COLUMN domainId INTEGER")
            # 添加外键约束
            conn.execute("ALTER TABLE datasources ADD CONSTRAINT fk_datasource_domain FOREIGN KEY (domainId) REFERENCES domains(id)")
            print("成功添加domainId字段到datasources表")
        else:
            print("domainId字段已存在")
    except Exception as e:
        print(f"添加domainId字段失败: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_domainid_column()
