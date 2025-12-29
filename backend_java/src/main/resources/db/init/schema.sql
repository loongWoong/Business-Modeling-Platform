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

-- 插入初始数据（基于 backend_ddd 数据库的实际数据）
-- 注意：ID 从 1 开始，因为 H2 的 AUTO_INCREMENT 从 1 开始

-- 插入业务域
-- 1. 默认领域（category类型，包含通用模型）
INSERT INTO domains (code, name, description, owner, domain_type, is_active, model_quota) VALUES
('default', '默认领域', '系统默认领域，包含通用业务模型', 'admin', 'category', TRUE, NULL);

-- 2. 路网设施域（workspace类型，工作空间）
INSERT INTO domains (code, name, description, owner, domain_type, is_active, model_quota, workspace_config) VALUES
('road_facility', '路网设施域', '管理高速公路路网设施', '路段管理部', 'workspace', TRUE, 20, '{"accessibleDomains": [1]}');
-- workspace_config说明：{"accessibleDomains": [1]} 表示工作空间可以访问ID为1的默认领域

-- 插入默认领域的通用模型（这些模型可以在工作空间中访问）
INSERT INTO models (code, name, description, creator, domain_id) VALUES
('user', '用户模型', '系统用户定义', 'admin', 1),
('role', '角色模型', '用户角色定义', 'admin', 1),
('permission', '权限模型', '系统权限定义', 'admin', 1),
('organization', '组织模型', '组织架构模型', 'admin', 1),
('department', '部门模型', '部门信息模型', 'admin', 1);

-- 插入路网设施域的高速收费相关模型（15个模型）
INSERT INTO models (code, name, description, creator, domain_id) VALUES
('road_owner', '路段业主', '高速公路路段业主', '路段管理部', 2),
('toll_road', '收费公路', '收费公路信息', '路段管理部', 2),
('toll_station', '收费站', '收费站信息', '路段管理部', 2),
('etc_gantry', 'ETC门架', 'ETC门架信息', '路段管理部', 2),
('toll_unit', '收费单元', '收费单元信息', '路段管理部', 2),
('lane', '车道', '收费站车道信息', '路段管理部', 2),
('marker_point', '标识点', '路径标识点', '路段管理部', 2),
('vehicle', '车辆', '车辆基本信息', '车辆管理部', 2),
('medium', '通行介质', '车辆通行介质', '车辆管理部', 2),
('transaction_record', '交易流水', '车辆交易流水记录', '收费管理部', 2),
('vehicle_path', '车辆通行路径', '车辆实际通行路径', '路径管理部', 2),
('fitted_path', '通行拟合路径', '拟合后的通行路径', '路径管理部', 2),
('split_detail', '拆分明细', '交易拆分详情', '收费管理部', 2),
('section', '收费路段', '收费路段模型', '收费管理部', 2),
('toll_plaza', '收费广场', '收费广场模型', '收费管理部', 2);

-- 插入属性（选择代表性的属性）
-- 默认领域的模型属性
-- 用户模型属性（model_id = 1）
INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key, description, physical_column) VALUES
('用户ID', 'id', 'LONG', 1, true, true, '用户唯一标识', 'id'),
('用户名', 'username', 'STRING', 1, true, false, '用户名', 'username'),
('密码', 'password', 'STRING', 1, true, false, '密码', 'password'),
('邮箱', 'email', 'STRING', 1, false, false, '邮箱地址', 'email'),
('角色ID', 'role_id', 'LONG', 1, false, false, '所属角色ID', 'role_id');

-- 角色模型属性（model_id = 2）
INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key, description, physical_column) VALUES
('角色ID', 'id', 'LONG', 2, true, true, '角色唯一标识', 'id'),
('角色名', 'name', 'STRING', 2, true, false, '角色名称', 'name'),
('角色编码', 'code', 'STRING', 2, true, false, '角色编码', 'code');

-- 组织模型属性（model_id = 3）
INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key, description, physical_column) VALUES
('组织ID', 'id', 'LONG', 3, true, true, '组织唯一标识', 'id'),
('组织名称', 'name', 'STRING', 3, true, false, '组织名称', 'name'),
('组织编码', 'code', 'STRING', 3, true, false, '组织编码', 'code');

-- 路网设施域的模型属性
-- 路段业主模型属性（model_id = 6，因为前面有5个默认领域的模型）
INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key, description, physical_column) VALUES
('业主ID', 'owner_id', 'STRING', 6, true, true, '路段业主唯一标识', 'owner_id'),
('业主名称', 'owner_name', 'STRING', 6, true, false, '路段业主名称', 'owner_name'),
('联系方式', 'contact_info', 'STRING', 6, true, false, '业主联系方式', 'contact_info');

-- 收费公路模型属性（model_id = 7）
INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key, description, physical_column, is_foreign_key, foreign_key_table, foreign_key_column) VALUES
('公路ID', 'road_id', 'STRING', 7, true, true, '收费公路唯一标识', 'road_id', false, NULL, NULL),
('公路名称', 'road_name', 'STRING', 7, true, false, '收费公路名称', 'road_name', false, NULL, NULL),
('路段业主', 'owner_id', 'STRING', 7, true, false, '所属路段业主ID', 'owner_id', true, 'road_owner', 'owner_id'),
('公路等级', 'road_level', 'STRING', 7, true, false, '公路等级', 'road_level', false, NULL, NULL),
('起始里程', 'start_mileage', 'DOUBLE', 7, true, false, '起始里程', 'start_mileage', false, NULL, NULL),
('结束里程', 'end_mileage', 'DOUBLE', 7, true, false, '结束里程', 'end_mileage', false, NULL, NULL);

-- 收费站模型属性（完整属性列表，确保模型详情页面各模块可展示数据）
-- model_id = 8（前面有：默认领域5个模型+路段业主1个+收费公路1个=7个，收费站是第8个）
INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key, description, physical_column) VALUES
('ID', 'id', 'STRING', 8, true, true, 'TollStation表的id字段', 'id'),
('路段ID', 'sectionId', 'STRING', 8, true, false, 'TollStation表的sectionId字段', 'sectionId'),
('编号', 'num', 'STRING', 8, true, false, 'TollStation表的num字段', 'num'),
('预留编号', 'reservedNum', 'STRING', 8, true, false, 'TollStation表的reservedNum字段', 'reservedNum'),
('名称', 'name', 'STRING', 8, true, false, 'TollStation表的name字段', 'name'),
('收费广场数量', 'tollPlazaCount', 'INTEGER', 8, true, false, 'TollStation表的tollPlazaCount字段', 'tollPlazaCount'),
('站编码', 'stationHex', 'STRING', 8, true, false, 'TollStation表的stationHex字段', 'stationHex'),
('线路类型', 'lineType', 'STRING', 8, true, false, 'TollStation表的lineType字段', 'lineType'),
('运营商', 'operators', 'STRING', 8, true, false, 'TollStation表的operators字段', 'operators'),
('数据融合点', 'dataMergePoint', 'STRING', 8, true, false, 'TollStation表的dataMergePoint字段', 'dataMergePoint'),
('IMEI', 'imei', 'STRING', 8, true, false, 'TollStation表的imei字段', 'imei'),
('IP地址', 'ip', 'STRING', 8, true, false, 'TollStation表的ip字段', 'ip'),
('SNMP版本', 'snmpVersion', 'STRING', 8, true, false, 'TollStation表的snmpVersion字段', 'snmpVersion'),
('SNMP端口', 'snmpPort', 'INTEGER', 8, true, false, 'TollStation表的snmpPort字段', 'snmpPort'),
('社区', 'community', 'STRING', 8, true, false, 'TollStation表的community字段', 'community'),
('安全名称', 'securityName', 'STRING', 8, true, false, 'TollStation表的securityName字段', 'securityName'),
('安全级别', 'securityLevel', 'STRING', 8, true, false, 'TollStation表的securityLevel字段', 'securityLevel'),
('认证', 'authentication', 'STRING', 8, true, false, 'TollStation表的authentication字段', 'authentication'),
('认证密钥', 'authKey', 'STRING', 8, true, false, 'TollStation表的authKey字段', 'authKey'),
('加密', 'encryption', 'STRING', 8, true, false, 'TollStation表的encryption字段', 'encryption'),
('密钥', 'secretKey', 'STRING', 8, true, false, 'TollStation表的secretKey字段', 'secretKey'),
('服务器厂商ID', 'serverManuID', 'STRING', 8, true, false, 'TollStation表的serverManuID字段', 'serverManuID'),
('服务器系统名称', 'serversysName', 'STRING', 8, true, false, 'TollStation表的serversysName字段', 'serversysName'),
('服务器系统版本', 'serversysVer', 'STRING', 8, true, false, 'TollStation表的serversysVer字段', 'serversysVer'),
('服务器日期版本', 'serverDateVer', 'STRING', 8, true, false, 'TollStation表的serverDateVer字段', 'serverDateVer'),
('类型', 'type', 'INTEGER', 8, true, false, 'TollStation表的type字段', 'type'),
('状态', 'status', 'INTEGER', 8, true, false, 'TollStation表的status字段', 'status'),
('实际类型', 'realType', 'INTEGER', 8, true, false, 'TollStation表的realType字段', 'realType'),
('区域名称', 'regionName', 'STRING', 8, true, false, 'TollStation表的regionName字段', 'regionName'),
('国家名称', 'countryName', 'STRING', 8, true, false, 'TollStation表的countryName字段', 'countryName'),
('行政区划代码', 'regionalismCode', 'STRING', 8, true, false, 'TollStation表的regionalismCode字段', 'regionalismCode'),
('代理门架ID', 'agencyGantryIds', 'STRING', 8, true, false, 'TollStation表的agencyGantryIds字段', 'agencyGantryIds');

-- ETC门架模型属性（model_id = 9）
INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key, description, physical_column) VALUES
('门架ID', 'gantry_id', 'STRING', 9, true, true, 'ETC门架唯一标识', 'gantry_id'),
('门架名称', 'gantry_name', 'STRING', 9, true, false, 'ETC门架名称', 'gantry_name');

-- 车道模型属性
INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key, description, physical_column) VALUES
('车道ID', 'lane_id', 'STRING', 6, true, true, '车道唯一标识', 'lane_id'),
('车道编号', 'lane_number', 'STRING', 6, true, false, '车道编号', 'lane_number'),
('收费站ID', 'station_id', 'STRING', 6, true, false, '所属收费站ID', 'station_id');

-- 车辆模型属性（模型ID=8）
INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key, description, physical_column) VALUES
('车辆ID', 'vehicle_id', 'STRING', 8, true, true, '车辆唯一标识', 'vehicle_id'),
('车牌号', 'plate_number', 'STRING', 8, true, false, '车牌号码', 'plate_number'),
('车辆类型', 'vehicle_type', 'STRING', 8, false, false, '车辆类型', 'vehicle_type');

-- 交易流水模型属性
INSERT INTO properties (name, code, type, model_id, is_required, is_primary_key, description, physical_column) VALUES
('交易流水ID', 'transaction_id', 'STRING', 10, true, true, '交易流水唯一标识', 'transaction_id'),
('车辆ID', 'vehicle_id', 'STRING', 10, true, false, '车辆ID', 'vehicle_id'),
('收费站ID', 'station_id', 'STRING', 10, true, false, '收费站ID', 'station_id'),
('交易金额', 'amount', 'DOUBLE', 10, true, false, '交易金额', 'amount'),
('交易时间', 'transaction_time', 'TIMESTAMP', 10, true, false, '交易时间', 'transaction_time');

-- 插入关系（包含收费站模型的所有关系，确保关系模块可展示）
-- 注意：模型ID分配 - 默认领域：1-5，工作空间：6-20
INSERT INTO relations (name, source_model_id, target_model_id, type, description, is_enabled) VALUES
-- 路段业主相关（工作空间模型ID：6=路段业主, 7=收费公路, 8=收费站, 9=ETC门架, 10=收费单元, 11=车道）
('路段业主-收费公路关系', 6, 7, 'one-to-many', '路段业主拥有多条收费公路', TRUE),
-- 收费公路相关
('收费公路-收费站关系', 7, 8, 'one-to-many', '收费公路包含多个收费站', TRUE),
('收费公路-ETC门架关系', 7, 9, 'one-to-many', '收费公路包含多个ETC门架', TRUE),
('收费公路-收费单元关系', 7, 10, 'one-to-many', '收费公路包含多个收费单元', TRUE),
-- 收费站相关（确保收费站模型详情页关系模块有数据）
('收费站-车道关系', 8, 11, 'one-to-many', '收费站包含多个车道', TRUE),
-- 车辆相关（工作空间模型ID：13=车辆, 14=通行介质, 15=交易流水）
('车辆-通行介质关系', 13, 14, 'one-to-many', '车辆拥有多个通行介质', TRUE),
('车辆-交易流水关系', 13, 15, 'one-to-many', '车辆产生多条交易流水', TRUE),
-- 交易流水相关（工作空间模型ID：16=车辆通行路径, 17=通行拟合路径, 18=拆分明细）
('交易流水-车辆通行路径关系', 15, 16, 'one-to-many', '交易流水对应车辆通行路径', TRUE),
('车辆通行路径-通行拟合路径关系', 16, 17, 'one-to-many', '车辆通行路径拟合后生成拟合路径', TRUE),
('通行拟合路径-拆分明细关系', 17, 18, 'one-to-many', '拟合路径拆分为明细', TRUE),
-- ETC门架相关（工作空间模型ID：9=ETC门架, 10=收费单元, 12=标识点）
('ETC门架-收费单元关系', 9, 10, 'one-to-many', 'ETC门架包含多个收费单元', TRUE),
('ETC门架-标识点关系', 9, 12, 'one-to-many', 'ETC门架包含多个标识点', TRUE),
-- 标识点相关
('标识点-交易流水关系', 12, 15, 'one-to-many', '标识点产生交易流水', TRUE),
-- 收费单元相关
('收费单元-拆分明细关系', 10, 18, 'one-to-many', '收费单元产生拆分明细', TRUE);

-- 插入数据源（确保收费站模型详情页数据源模块有数据）
-- domain_id: 1=默认领域, 2=路网设施域工作空间
-- model_id: 6=路段业主, 8=收费站
INSERT INTO datasources (name, type, url, status, description, domain_id, username, password, table_name, model_id) VALUES
('路段业主MySQL', 'mysql', 'jdbc:mysql://localhost:3306/expressway', 'inactive', '路段业主信息库', 2, 'root', 'password', 't_road_owner', 6),
('业务数据库', 'mysql', 'jdbc:mysql://192.168.22.212:3306/lwssy', 'active', '业务数据库', 2, 'root', '123456', NULL, NULL),
('演示模型数据源', 'duckdb', 'business_data.db', 'active', '演示模型数据源，包含TollStation表', 2, NULL, NULL, 'TollStation', 8),
('收费站数据源', 'duckdb', 'business_data.db', 'active', '收费站模型专用数据源', 2, NULL, NULL, 'TollStation', 8);

-- 插入模型表关联（确保收费站模型详情页数据源模块可展示关联表）
-- model_id: 8=收费站, datasource_id: 3=演示模型数据源, 4=收费站数据源
INSERT INTO model_table_associations (model_id, datasource_id, table_name, status) VALUES
(8, 3, 'TollStation', 'active'),
(8, 4, 'TollStation', 'active');

-- 插入字段映射（收费站模型的部分字段映射示例）
-- 注意：property_id 需要根据实际插入的属性ID来设置
-- 属性ID计算：默认领域模型属性(约15个) + 路段业主3个 + 收费公路6个 = 约24个
-- 收费站模型第一个属性id约=25（id字段），第二个属性id约=26（sectionId字段），以此类推
-- 这里使用固定ID，假设属性按顺序插入
-- model_id: 8=收费站, datasource_id: 3=演示模型数据源
INSERT INTO mappings (datasource_id, model_id, field_id, property_id) VALUES
(3, 8, 'id', 25),
(3, 8, 'sectionId', 26),
(3, 8, 'num', 27),
(3, 8, 'name', 29),
(3, 8, 'tollPlazaCount', 30);

-- 插入ETL任务（确保收费站模型详情页ETL模块有数据）
-- target_model_id: 8=收费站, source_datasource_id: 3=演示模型数据源, 4=收费站数据源
INSERT INTO etl_tasks (name, source_datasource_id, target_model_id, description, task_status, schedule, config) VALUES
('收费站ETL任务', 3, 8, '从TollStation表获取数据到收费站模型', 'active', '0 */1 * * *', '{"source": {"tableName": "TollStation"}, "target": {"modelId": 8}, "mode": "upsert"}'),
('收费站数据同步', 4, 8, '从演示数据源同步收费站数据', 'active', '0 0 * * *', '{"source": {"tableName": "TollStation"}, "target": {"modelId": 8}, "mode": "full"}');

-- 插入ETL日志（确保收费站模型详情页ETL模块可展示执行日志）
-- 使用 DATEADD 函数计算时间（H2语法）
INSERT INTO etl_logs (task_id, status, start_time, end_time, records_processed, records_success, records_failed, error_message) VALUES
(1, 'success', DATEADD('HOUR', -1, CURRENT_TIMESTAMP), DATEADD('MINUTE', -55, CURRENT_TIMESTAMP), 1000, 1000, 0, NULL),
(1, 'success', DATEADD('HOUR', -2, CURRENT_TIMESTAMP), DATEADD('MINUTE', -114, CURRENT_TIMESTAMP), 1500, 1500, 0, NULL),
(2, 'success', DATEADD('DAY', -1, CURRENT_TIMESTAMP), DATEADD('MINUTE', -1430, CURRENT_TIMESTAMP), 5000, 5000, 0, NULL);

-- 插入共享属性（确保语义层模块有数据）
-- domain_id: 2=路网设施域工作空间
INSERT INTO shared_attributes (code, name, type, domain_id, description, is_required) VALUES
('station_code', '站编码', 'STRING', 2, '收费站编码标准', TRUE),
('road_level', '公路等级', 'STRING', 2, '公路等级分类', TRUE),
('vehicle_type', '车辆类型', 'STRING', 2, '车辆类型分类', TRUE);

-- 插入指标（确保语义层模块有数据）
INSERT INTO indicators (code, name, domain_id, description, expression, return_type, unit, status, creator) VALUES
('station_count', '收费站数量', 2, '统计收费站总数', 'COUNT(toll_station)', 'number', '个', 'active', '系统'),
('daily_transaction_count', '日交易量', 2, '统计每日交易流水数量', 'COUNT(transaction_record WHERE date = CURRENT_DATE)', 'number', '笔', 'active', '系统'),
('avg_toll_amount', '平均收费金额', 2, '计算平均收费金额', 'AVG(transaction_record.amount)', 'number', '元', 'active', '系统');

-- 插入函数（确保语义层模块有数据）
INSERT INTO functions (code, name, domain_id, description, function_type, implementation, return_type, status, creator) VALUES
('calculate_toll', '计算收费', 2, '根据里程和车型计算收费金额', 'calculation', 'function calculate_toll(mileage, vehicle_type) { return mileage * rate[vehicle_type]; }', 'number', 'active', '系统'),
('format_station_code', '格式化站编码', 2, '格式化收费站编码为标准格式', 'format', 'function format_station_code(code) { return code.padStart(6, "0"); }', 'string', 'active', '系统');

-- 插入数据血缘（确保收费站模型详情页数据血缘模块有数据）
-- model_id: 7=收费公路, 8=收费站, 11=车道, 15=交易流水
INSERT INTO data_lineage (source_model_id, target_model_id, source_property, target_property, lineage_type, transformation, datasource_id, etl_task_id, description, confidence_score, is_auto_discovered) VALUES
-- 收费公路 -> 收费站（正向血缘）
(7, 8, 'road_id', 'sectionId', 'forward', 'direct_mapping', NULL, 1, '收费公路数据流向收费站', 1.0, FALSE),
-- 收费站 -> 车道（正向血缘）
(8, 11, 'id', 'station_id', 'forward', 'direct_mapping', NULL, NULL, '收费站数据流向车道', 1.0, FALSE),
-- 收费站 -> 交易流水（正向血缘）
(8, 15, 'id', 'station_id', 'forward', 'direct_mapping', NULL, NULL, '收费站产生交易流水', 1.0, FALSE),
-- 交易流水 -> 收费站（反向血缘）
(15, 8, 'station_id', 'id', 'reverse', 'direct_mapping', NULL, NULL, '交易流水追溯到收费站', 1.0, FALSE);
