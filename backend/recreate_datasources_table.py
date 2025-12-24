import duckdb
import os

# 获取当前脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))

# 定义数据库路径
DB_PATH = os.path.join(script_dir, 'app.data.db')

def recreate_datasources_table():
    """重新创建包含domainId字段的datasources表"""
    conn = duckdb.connect(DB_PATH)
    try:
        # 1. 检查datasources表是否存在
        tables = conn.execute("SHOW TABLES").fetchall()
        datasources_exists = any(table[0] == 'datasources' for table in tables)
        
        # 2. 创建新的包含domainId字段的datasources表
        print("创建新的datasources表...")
        # 使用临时表名创建新表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS datasources_new (
            id INTEGER PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            url TEXT NOT NULL,
            tableName VARCHAR(100),
            status VARCHAR(50),
            description TEXT,
            modelId INTEGER,
            domainId INTEGER,
            createdAt DATE,
            updatedAt DATE,
            FOREIGN KEY (modelId) REFERENCES models(id),
            FOREIGN KEY (domainId) REFERENCES domains(id)
        )
        """)
        
        # 3. 如果旧表存在，插入默认数据或迁移数据
        if datasources_exists:
            print("向新表插入默认数据...")
            # 直接插入默认数据，不迁移旧数据，避免类型转换问题
            conn.execute("""
            INSERT INTO datasources_new (id, name, type, url, tableName, status, description, modelId, domainId, createdAt, updatedAt) 
            VALUES 
            (1, '路段业主MySQL', 'mysql', 'jdbc:mysql://localhost:3306/expressway', 't_road_owner', 'active', '路段业主信息表', 1, 3, '2025-12-22', '2025-12-22'),
            (2, '收费公路MySQL', 'mysql', 'jdbc:mysql://localhost:3306/expressway', 't_toll_road', 'active', '收费公路信息表', 2, 3, '2025-12-22', '2025-12-22'),
            (3, '收费站MySQL', 'mysql', 'jdbc:mysql://localhost:3306/expressway', 't_toll_station', 'active', '收费站信息表', 3, 3, '2025-12-22', '2025-12-22')
            """)
        else:
            print("旧表不存在，创建空表...")
        
        # 4. 删除旧表（如果存在）
        if datasources_exists:
            print("删除旧的datasources表...")
            conn.execute("DROP TABLE IF EXISTS datasources")
        
        # 5. 将新表重命名为正式表名
        print("重命名新表为datasources...")
        conn.execute("ALTER TABLE datasources_new RENAME TO datasources")
        
        print("datasources表重新创建成功，包含domainId字段")
    except Exception as e:
        print(f"重新创建datasources表失败: {e}")
        # 如果失败，清理临时表
        conn.execute("DROP TABLE IF EXISTS datasources_new")
    finally:
        conn.close()

if __name__ == "__main__":
    recreate_datasources_table()
