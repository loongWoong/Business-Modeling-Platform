-- 业务建模平台数据库初始化脚本
-- 数据库: H2
-- 创建时间: 2024
-- 注意：使用 CREATE TABLE IF NOT EXISTS + ALTER TABLE 方式，避免数据丢失

-- 创建领域表（如果不存在）
CREATE TABLE IF NOT EXISTS domains (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    owner VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 为现有domains表添加新字段
-- 如果字段已存在，会报错但 continue-on-error: true 会忽略错误
-- 使用匿名代码块来检查字段是否存在（H2兼容方式）
-- 注意：如果H2版本不支持，可以直接执行ALTER TABLE，错误会被忽略

-- 方法1：直接执行（推荐，错误会被continue-on-error忽略）
ALTER TABLE domains ADD COLUMN domain_type VARCHAR(20) DEFAULT 'category';
ALTER TABLE domains ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE domains ADD COLUMN model_quota INT;
ALTER TABLE domains ADD COLUMN permissions TEXT;
ALTER TABLE domains ADD COLUMN workspace_config TEXT;

-- 更新现有记录的默认值
UPDATE domains SET domain_type = 'category' WHERE domain_type IS NULL;
UPDATE domains SET is_active = TRUE WHERE is_active IS NULL;

-- 创建模型表（如果不存在）
CREATE TABLE IF NOT EXISTS models (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    creator VARCHAR(100),
    domain_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id)
);

-- 创建属性表（如果不存在）
CREATE TABLE IF NOT EXISTS properties (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    type VARCHAR(50) NOT NULL,
    model_id BIGINT NOT NULL,
    is_required BOOLEAN DEFAULT FALSE,
    description TEXT,
    is_primary_key BOOLEAN DEFAULT FALSE,
    is_foreign_key BOOLEAN DEFAULT FALSE,
    default_value VARCHAR(255),
    constraints TEXT,
    sensitivity_level VARCHAR(50),
    mask_rule VARCHAR(100),
    physical_column VARCHAR(100),
    foreign_key_table VARCHAR(100),
    foreign_key_column VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- 创建关系表（如果不存在）
CREATE TABLE IF NOT EXISTS relations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    source_model_id BIGINT NOT NULL,
    target_model_id BIGINT NOT NULL,
    type VARCHAR(20) DEFAULT 'one-to-many',
    description TEXT,
    is_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_model_id) REFERENCES models(id) ON DELETE CASCADE,
    FOREIGN KEY (target_model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- 创建数据源表（如果不存在）
CREATE TABLE IF NOT EXISTS datasources (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    type VARCHAR(50) NOT NULL,
    url VARCHAR(500) NOT NULL,
    domain_id BIGINT,
    username VARCHAR(100),
    password VARCHAR(100),
    table_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'inactive',
    description TEXT,
    model_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id)
);

-- 创建字段映射表（如果不存在）
CREATE TABLE IF NOT EXISTS mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    datasource_id BIGINT NOT NULL,
    model_id BIGINT NOT NULL,
    field_id VARCHAR(100) NOT NULL,
    property_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (datasource_id) REFERENCES datasources(id) ON DELETE CASCADE,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE
);

-- 创建模型表关联表（如果不存在）
CREATE TABLE IF NOT EXISTS model_table_associations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_id BIGINT NOT NULL,
    datasource_id BIGINT NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (model_id) REFERENCES models(id) ON DELETE CASCADE,
    FOREIGN KEY (datasource_id) REFERENCES datasources(id) ON DELETE CASCADE
);

-- 创建ETL任务表（如果不存在）
CREATE TABLE IF NOT EXISTS etl_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    source_datasource_id BIGINT NOT NULL,
    target_model_id BIGINT NOT NULL,
    description TEXT,
    task_status VARCHAR(20) DEFAULT 'inactive',
    schedule TEXT,
    config TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_run VARCHAR(50),
    next_run VARCHAR(50),
    FOREIGN KEY (source_datasource_id) REFERENCES datasources(id),
    FOREIGN KEY (target_model_id) REFERENCES models(id)
);

-- 创建ETL日志表（如果不存在）
CREATE TABLE IF NOT EXISTS etl_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_id BIGINT NOT NULL,
    status VARCHAR(20),
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    records_processed INT DEFAULT 0,
    records_success INT DEFAULT 0,
    records_failed INT DEFAULT 0,
    error_message TEXT,
    details TEXT,
    FOREIGN KEY (task_id) REFERENCES etl_tasks(id) ON DELETE CASCADE
);

-- 创建语义层表：共享属性（如果不存在）
CREATE TABLE IF NOT EXISTS shared_attributes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL,
    domain_id BIGINT,
    description TEXT,
    is_required BOOLEAN DEFAULT FALSE,
    default_value VARCHAR(255),
    min_length INT,
    max_length INT,
    pattern VARCHAR(255),
    sensitivity_level VARCHAR(50),
    mask_rule VARCHAR(100),
    used_by_models TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id)
);

-- 创建语义层表：指标（如果不存在）
CREATE TABLE IF NOT EXISTS indicators (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    domain_id BIGINT,
    description TEXT,
    expression TEXT NOT NULL,
    return_type VARCHAR(50) DEFAULT 'number',
    unit VARCHAR(50),
    dimensions TEXT,
    filters TEXT,
    sort_fields TEXT,
    related_properties TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    creator VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id)
);

-- 创建语义层表：函数（如果不存在）
CREATE TABLE IF NOT EXISTS functions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    domain_id BIGINT,
    description TEXT,
    function_type VARCHAR(50),
    implementation TEXT NOT NULL,
    parameters TEXT,
    return_type VARCHAR(50),
    usage_examples TEXT,
    status VARCHAR(20) DEFAULT 'draft',
    creator VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (domain_id) REFERENCES domains(id)
);

-- 创建数据血缘表（如果不存在）
CREATE TABLE IF NOT EXISTS data_lineage (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_model_id BIGINT NOT NULL,
    target_model_id BIGINT NOT NULL,
    source_property VARCHAR(100),
    target_property VARCHAR(100),
    lineage_type VARCHAR(20) DEFAULT 'forward',
    transformation TEXT,
    datasource_id BIGINT,
    etl_task_id BIGINT,
    description TEXT,
    confidence_score DOUBLE DEFAULT 1.0,
    is_auto_discovered BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (source_model_id) REFERENCES models(id),
    FOREIGN KEY (target_model_id) REFERENCES models(id),
    FOREIGN KEY (datasource_id) REFERENCES datasources(id),
    FOREIGN KEY (etl_task_id) REFERENCES etl_tasks(id)
);

-- 创建索引
CREATE INDEX idx_models_domain_id ON models(domain_id);
CREATE INDEX idx_properties_model_id ON properties(model_id);
CREATE INDEX idx_relations_source ON relations(source_model_id);
CREATE INDEX idx_relations_target ON relations(target_model_id);
CREATE INDEX idx_datasources_domain_id ON datasources(domain_id);
CREATE INDEX idx_datasources_type ON datasources(type);
CREATE INDEX idx_mappings_datasource_id ON mappings(datasource_id);
CREATE INDEX idx_mappings_property_id ON mappings(property_id);
CREATE INDEX idx_etl_tasks_source ON etl_tasks(source_datasource_id);
CREATE INDEX idx_etl_tasks_target ON etl_tasks(target_model_id);
CREATE INDEX idx_etl_logs_task_id ON etl_logs(task_id);
CREATE INDEX idx_shared_attributes_domain_id ON shared_attributes(domain_id);
CREATE INDEX idx_indicators_domain_id ON indicators(domain_id);
CREATE INDEX idx_indicators_status ON indicators(status);
CREATE INDEX idx_functions_domain_id ON functions(domain_id);
CREATE INDEX idx_functions_type ON functions(function_type);
CREATE INDEX idx_data_lineage_source ON data_lineage(source_model_id);
CREATE INDEX idx_data_lineage_target ON data_lineage(target_model_id);
CREATE INDEX idx_data_lineage_type ON data_lineage(lineage_type);
CREATE INDEX idx_data_lineage_etl ON data_lineage(etl_task_id);

-- 插入初始数据
INSERT INTO domains (code, name, description, owner, domain_type, is_active) VALUES
('default', '默认领域', '系统默认领域', 'admin', 'category', TRUE),
('user_management', '用户管理', '用户和权限管理领域', 'admin', 'workspace', TRUE);

INSERT INTO models (code, name, description, creator, domain_id) VALUES
('user', '用户模型', '系统用户定义', 'admin', 1),
('role', '角色模型', '用户角色定义', 'admin', 1),
('permission', '权限模型', '系统权限定义', 'admin', 1);

INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key) VALUES
('用户ID', 'id', 'LONG', 1, true, true),
('用户名', 'username', 'STRING', 1, true, false),
('密码', 'password', 'STRING', 1, true, false),
('邮箱', 'email', 'STRING', 1, false, false),
('角色ID', 'role_id', 'LONG', 1, false, false);

INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key) VALUES
('角色ID', 'id', 'LONG', 2, true, true),
('角色名', 'name', 'STRING', 2, true, false),
('角色编码', 'code', 'STRING', 2, true, false);

INSERT INTO relations (name, source_model_id, target_model_id, type, description) VALUES
('用户-角色关系', 1, 2, 'many-to-one', '用户所属角色');

-- 数据源示例
INSERT INTO datasources (name, type, url, status, description, domain_id) VALUES
('MySQL主库', 'mysql', 'jdbc:mysql://localhost:3306/jianmo', 'inactive', '主业务数据库', 1),
('测试数据库', 'h2', 'jdbc:h2:./test.db', 'inactive', '测试用数据库', 1);

-- 插入元模型数据用于测试
INSERT INTO etl_tasks (name, source_datasource_id, target_model_id, description, task_status) VALUES
('用户数据同步', 1, 1, '从MySQL同步用户数据到模型', 'inactive'),
('角色数据同步', 1, 2, '从MySQL同步角色数据到模型', 'inactive');
