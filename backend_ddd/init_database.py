"""
数据库初始化脚本
基于领域模型创建数据库表结构
"""
import duckdb
import os

# 获取当前脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))

# 定义数据库路径（使用backend_ddd目录下的数据库）
DB_PATH = os.path.join(script_dir, 'app.data.db')


def create_tables():
    """创建数据库表"""
    conn = duckdb.connect(DB_PATH)
    
    try:
        # 创建业务域表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS domains (
            id INTEGER PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            owner VARCHAR(100),
            updatedAt DATE
        )
        """)
        
        # 创建模型表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS models (
            id INTEGER PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(100) NOT NULL,
            description TEXT,
            creator VARCHAR(100),
            updatedAt DATE,
            domainId INTEGER,
            FOREIGN KEY (domainId) REFERENCES domains(id)
        )
        """)
        
        # 创建属性表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS properties (
            id INTEGER PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            required BOOLEAN,
            description TEXT,
            modelId INTEGER,
            isPrimaryKey BOOLEAN DEFAULT FALSE,
            isForeignKey BOOLEAN DEFAULT FALSE,
            defaultValue TEXT,
            constraints TEXT,
            sensitivityLevel VARCHAR(20),
            maskRule TEXT,
            physicalColumn VARCHAR(100),
            foreignKeyTable VARCHAR(100),
            foreignKeyColumn VARCHAR(100),
            FOREIGN KEY (modelId) REFERENCES models(id)
        )
        """)
        
        # 创建关系表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS relations (
            id INTEGER PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            sourceModelId INTEGER NOT NULL,
            targetModelId INTEGER NOT NULL,
            type VARCHAR(50) DEFAULT 'one-to-many',
            description TEXT,
            enabled BOOLEAN DEFAULT TRUE,
            FOREIGN KEY (sourceModelId) REFERENCES models(id),
            FOREIGN KEY (targetModelId) REFERENCES models(id)
        )
        """)
        
        # 创建数据源表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS datasources (
            id INTEGER PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            url VARCHAR(500) NOT NULL,
            username VARCHAR(100),
            password VARCHAR(100),
            tableName VARCHAR(100),
            status VARCHAR(20) DEFAULT 'inactive',
            description TEXT,
            modelId INTEGER,
            domainId INTEGER,
            createdAt DATE,
            updatedAt DATE,
            FOREIGN KEY (modelId) REFERENCES models(id),
            FOREIGN KEY (domainId) REFERENCES domains(id)
        )
        """)
        
        # 创建字段映射表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS mappings (
            id INTEGER PRIMARY KEY,
            datasourceId INTEGER NOT NULL,
            modelId INTEGER NOT NULL,
            fieldId VARCHAR(100) NOT NULL,
            propertyId INTEGER NOT NULL,
            createdAt DATE,
            updatedAt DATE,
            FOREIGN KEY (datasourceId) REFERENCES datasources(id),
            FOREIGN KEY (modelId) REFERENCES models(id),
            FOREIGN KEY (propertyId) REFERENCES properties(id)
        )
        """)
        
        # 创建模型表关联表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS model_table_associations (
            id INTEGER PRIMARY KEY,
            modelId INTEGER NOT NULL,
            datasourceId INTEGER NOT NULL,
            tableName VARCHAR(100) NOT NULL,
            status VARCHAR(20) DEFAULT 'active',
            createdAt DATE,
            updatedAt DATE,
            FOREIGN KEY (modelId) REFERENCES models(id),
            FOREIGN KEY (datasourceId) REFERENCES datasources(id)
        )
        """)
        
        # 创建ETL任务表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS etl_tasks (
            id INTEGER PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            sourceDatasourceId INTEGER NOT NULL,
            targetModelId INTEGER NOT NULL,
            description TEXT,
            status VARCHAR(20) DEFAULT 'inactive',
            schedule VARCHAR(100),
            config TEXT,
            createdAt DATE,
            updatedAt DATE,
            lastRun DATE,
            nextRun DATE,
            FOREIGN KEY (sourceDatasourceId) REFERENCES datasources(id),
            FOREIGN KEY (targetModelId) REFERENCES models(id)
        )
        """)
        
        # 创建ETL日志表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS etl_logs (
            id INTEGER PRIMARY KEY,
            taskId INTEGER NOT NULL,
            status VARCHAR(20) NOT NULL,
            startTime DATE,
            endTime DATE,
            recordsProcessed INTEGER DEFAULT 0,
            recordsSuccess INTEGER DEFAULT 0,
            recordsFailed INTEGER DEFAULT 0,
            errorMessage TEXT,
            details TEXT,
            FOREIGN KEY (taskId) REFERENCES etl_tasks(id)
        )
        """)
        
        conn.commit()
        print("数据库表创建成功！")
    except Exception as e:
        print(f"创建数据库表失败: {e}")
        conn.rollback()
    finally:
        conn.close()


if __name__ == '__main__':
    create_tables()

