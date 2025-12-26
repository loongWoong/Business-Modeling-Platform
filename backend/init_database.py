"""
数据库初始化脚本
根据后端实体定义创建所有数据库表
"""
import duckdb
import os
from datetime import date

# 获取当前脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))

# 定义数据库路径
DB_PATH = os.path.join(script_dir, 'app.data.db')

def create_tables():
    """创建数据库表"""
    # 连接到DuckDB数据库
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
        
        # 创建域边表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS domain_edges (
            source INTEGER,
            target INTEGER,
            PRIMARY KEY (source, target)
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
        
        # 创建模型边表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS model_edges (
            source INTEGER,
            target INTEGER,
            PRIMARY KEY (source, target)
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
        
        # 创建共享属性表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS shared_attributes (
            id INTEGER PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(100) NOT NULL,
            type VARCHAR(50) NOT NULL,
            description TEXT,
            domainId INTEGER,
            FOREIGN KEY (domainId) REFERENCES domains(id)
        )
        """)
        
        # 创建指标表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS indicators (
            id INTEGER PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            code VARCHAR(100) NOT NULL,
            description TEXT,
            expression TEXT,
            category VARCHAR(50),
            unit VARCHAR(20),
            dataType VARCHAR(50),
            aggregationMethod VARCHAR(50),
            domainId INTEGER,
            modelId INTEGER,
            creator VARCHAR(100),
            createdAt DATE,
            updatedAt DATE,
            status VARCHAR(20) DEFAULT 'active',
            FOREIGN KEY (domainId) REFERENCES domains(id),
            FOREIGN KEY (modelId) REFERENCES models(id)
        )
        """)
        
        # 创建数据源表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS datasources (
            id INTEGER PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            type VARCHAR(50) NOT NULL,
            url TEXT NOT NULL,
            username VARCHAR(100),
            password TEXT,
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
        
        # 创建函数表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS functions (
            id INTEGER PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            code TEXT NOT NULL,
            inputSchema TEXT,
            returnType VARCHAR(50),
            version VARCHAR(20) DEFAULT '1.0',
            metadata TEXT,
            domainId INTEGER,
            createdAt DATE,
            updatedAt DATE,
            FOREIGN KEY (domainId) REFERENCES domains(id)
        )
        """)
        
        # 创建动作类型表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS action_types (
            id INTEGER PRIMARY KEY,
            name VARCHAR(200) NOT NULL,
            description TEXT,
            inputSchema TEXT,
            outputSchema TEXT,
            requiresApproval BOOLEAN DEFAULT FALSE,
            handlerFunction VARCHAR(200),
            createdAt DATE,
            updatedAt DATE
        )
        """)
        
        # 创建映射表
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
            status VARCHAR(50) DEFAULT 'active',
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
            name VARCHAR(200) NOT NULL,
            description TEXT,
            sourceDatasourceId INTEGER NOT NULL,
            targetModelId INTEGER NOT NULL,
            status VARCHAR(50) DEFAULT 'inactive',
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
            status VARCHAR(50) NOT NULL,
            message TEXT,
            startTime TIMESTAMP,
            endTime TIMESTAMP,
            recordsProcessed INTEGER DEFAULT 0,
            FOREIGN KEY (taskId) REFERENCES etl_tasks(id)
        )
        """)
        
        # 创建数据记录表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS data_records (
            id INTEGER PRIMARY KEY,
            modelId INTEGER NOT NULL,
            datasourceId INTEGER,
            data TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (modelId) REFERENCES models(id),
            FOREIGN KEY (datasourceId) REFERENCES datasources(id)
        )
        """)
        
        # 创建模型指标关联表
        conn.execute("""
        CREATE TABLE IF NOT EXISTS model_indicators (
            modelId INTEGER NOT NULL,
            indicatorId INTEGER NOT NULL,
            PRIMARY KEY (modelId, indicatorId),
            FOREIGN KEY (modelId) REFERENCES models(id),
            FOREIGN KEY (indicatorId) REFERENCES indicators(id)
        )
        """)
        
        print("所有表创建成功！")
        
    except Exception as e:
        print(f"创建表时出错: {e}")
        raise
    finally:
        # 关闭连接
        conn.close()

def main():
    """主函数，执行数据库初始化"""
    print("开始初始化数据库...")
    print(f"数据库路径: {DB_PATH}")
    
    create_tables()
    
    print("数据库初始化完成！")
    print(f"数据库文件位置: {DB_PATH}")

if __name__ == "__main__":
    main()