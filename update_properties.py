import duckdb
import os
import re

# 配置文件路径
CONFIG_PATH = 'c:\\Users\\leon\\Downloads\\trae-build-demo\\testScript\\config.py'
# 数据库路径
DB_PATH = 'c:\\Users\\leon\\Downloads\\trae-build-demo\\backend\\app.data.db'

# 表名映射关系：config.py表名 -> 数据库模型名
TABLE_MODEL_MAPPING = {
    'Vehicle': 'vehicle',
    'Medium': 'medium',
    'Transaction': 'transaction_record',
    'TollRoad': 'toll_road',
    'SectionOwner': 'road_owner',
    'Section': 'section',
    'TollStation': 'toll_station',
    'TollPlaza': 'toll_plaza',
    'TollGantry': 'etc_gantry',
    'TollInterval': 'toll_unit',
    'TollLane': 'lane',
    'Path': 'vehicle_path',
    'RestorePath': 'fitted_path',
    'SplitDetail': 'split_detail'
}

# 从config.py中提取表结构
def extract_tables_from_config():
    with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tables = {}
    # 匹配CREATE TABLE语句
    table_pattern = re.compile(r'CREATE TABLE IF NOT EXISTS (\w+) \(([^\)]+)\)', re.DOTALL)
    table_matches = table_pattern.findall(content)
    
    for table_name, table_content in table_matches:
        # 提取字段信息
        fields = []
        # 匹配字段定义，忽略PRIMARY KEY等约束
        field_pattern = re.compile(r'\s*(\w+)\s+(\w+)', re.MULTILINE)
        field_matches = field_pattern.findall(table_content)
        
        for field_name, field_type in field_matches:
            if field_name.upper() not in ['PRIMARY', 'KEY']:
                # 转换字段类型为标准类型
                if field_type.upper() in ['STRING']:
                    standard_type = 'string'
                elif field_type.upper() in ['INTEGER']:
                    standard_type = 'integer'
                elif field_type.upper() in ['BIGINT']:
                    standard_type = 'integer'
                elif field_type.upper() in ['DATE']:
                    standard_type = 'date'
                elif field_type.upper() in ['BOOLEAN']:
                    standard_type = 'boolean'
                else:
                    standard_type = 'string'
                
                fields.append({'name': field_name, 'type': standard_type})
        
        tables[table_name] = fields
    
    return tables

# 从数据库中读取模型
def get_db_models():
    conn = duckdb.connect(DB_PATH)
    models_df = conn.execute('SELECT id, code FROM models').fetchdf()
    models = {row['code']: row['id'] for _, row in models_df.iterrows()}
    conn.close()
    return models

# 更新properties表
def update_properties():
    print("=== 开始更新properties表 ===")
    
    # 从config.py提取表结构
    config_tables = extract_tables_from_config()
    print(f"\n1. 从config.py中提取了 {len(config_tables)} 个表")
    
    # 从数据库读取模型
    db_models = get_db_models()
    print(f"\n2. 从数据库中读取了 {len(db_models)} 个模型")
    
    # 连接数据库
    conn = duckdb.connect(DB_PATH)
    
    # 开始事务
    conn.execute('BEGIN TRANSACTION')
    
    try:
        # 遍历每个表，更新对应的属性
        total_added = 0
        total_updated = 0
        
        for config_table, fields in config_tables.items():
            # 获取对应的数据库模型名
            db_model_name = TABLE_MODEL_MAPPING[config_table]
            
            # 检查模型是否存在
            if db_model_name not in db_models:
                print(f"   ⚠️  模型 {db_model_name} 不存在，跳过")
                continue
            
            model_id = db_models[db_model_name]
            print(f"\n   处理表 {config_table} -> 模型 {db_model_name} (ID: {model_id})")
            print(f"   包含 {len(fields)} 个字段")
            
            # 获取该模型的现有属性
            existing_properties_df = conn.execute('SELECT id, code FROM properties WHERE modelId = ?', [model_id]).fetchdf()
            existing_properties = {row['code']: row['id'] for _, row in existing_properties_df.iterrows()}
            print(f"   现有属性: {list(existing_properties.keys())}")
            
            # 处理每个字段
            for field in fields:
                field_name = field['name']
                # 检查是否是主键
                is_primary_key = field_name == 'id'
                
                if field_name in existing_properties:
                    # 属性已存在，更新它
                    prop_id = existing_properties[field_name]
                    conn.execute('''
                    UPDATE properties 
                    SET name = ?, type = ?, required = ?, description = ?, isPrimaryKey = ?, isForeignKey = ?
                    WHERE id = ?
                    ''', [
                        field_name,     # name
                        field['type'],  # type
                        True,           # required
                        f'{config_table}表的{field_name}字段',  # description
                        is_primary_key, # isPrimaryKey
                        False,          # isForeignKey
                        prop_id         # id
                    ])
                    total_updated += 1
                else:
                    # 属性不存在，获取新的id并插入
                    max_id_result = conn.execute('SELECT COALESCE(MAX(id), 0) as max_id FROM properties').fetchone()
                    new_id = max_id_result[0] + 1
                    
                    conn.execute('''
                    INSERT INTO properties (id, name, code, type, required, description, modelId, isPrimaryKey, isForeignKey)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                    ''', [
                        new_id,         # id (手动递增)
                        field_name,     # name
                        field_name,     # code
                        field['type'],  # type
                        True,           # required
                        f'{config_table}表的{field_name}字段',  # description
                        model_id,       # modelId
                        is_primary_key, # isPrimaryKey
                        False           # isForeignKey
                    ])
                    total_added += 1
                    new_id += 1
        
        print(f"\n3. 共添加了 {total_added} 条新属性记录")
        print(f"   共更新了 {total_updated} 条现有属性记录")
        
        # 提交事务
        conn.execute('COMMIT')
        print("\n4. 所有属性已成功更新到properties表")
        
        # 验证更新结果
        properties_count = conn.execute('SELECT COUNT(*) FROM properties').fetchone()[0]
        print(f"   共插入 {properties_count} 条属性记录")
        
    except Exception as e:
        # 回滚事务
        conn.execute('ROLLBACK')
        print(f"\n❌ 更新失败，已回滚事务: {e}")
    finally:
        conn.close()

# 主函数
if __name__ == '__main__':
    update_properties()