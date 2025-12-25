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
        
        for field_name, _ in field_matches:
            if field_name.upper() not in ['PRIMARY', 'KEY']:
                fields.append(field_name)
        
        tables[table_name] = fields
    
    return tables

# 从数据库中读取模型和属性
def get_db_models_and_properties():
    conn = duckdb.connect(DB_PATH)
    
    # 读取models表
    models = {}
    models_df = conn.execute('SELECT id, code FROM models').fetchdf()
    for _, row in models_df.iterrows():
        models[row['code']] = row['id']
    
    # 读取properties表
    properties = {}
    properties_df = conn.execute('SELECT modelId, code FROM properties').fetchdf()
    for _, row in properties_df.iterrows():
        model_id = row['modelId']
        field_name = row['code']
        if model_id not in properties:
            properties[model_id] = []
        properties[model_id].append(field_name)
    
    conn.close()
    return models, properties

# 主函数
def main():
    print("=== 开始检查数据库模型和属性 ===")
    
    # 从config.py提取表结构
    config_tables = extract_tables_from_config()
    print(f"\n1. 从config.py中提取了 {len(config_tables)} 个表")
    
    # 从数据库读取模型和属性
    db_models, db_properties = get_db_models_and_properties()
    print(f"\n2. 从数据库中读取了 {len(db_models)} 个模型")
    
    # 检查模型是否匹配
    print("\n3. 模型匹配检查:")
    all_models_match = True
    
    for config_table, db_model in TABLE_MODEL_MAPPING.items():
        if db_model not in db_models:
            print(f"   ❌ 数据库中缺失模型: {db_model} (对应config.py中的{config_table})")
            all_models_match = False
    
    # 检查数据库中是否有多余的模型
    mapped_db_models = set(TABLE_MODEL_MAPPING.values())
    extra_models = set(db_models.keys()) - mapped_db_models
    if extra_models:
        print(f"   ❌ 数据库中存在多余模型: {extra_models}")
        all_models_match = False
    
    if all_models_match:
        print("   ✅ 所有模型匹配正确")
    
    # 检查属性是否匹配
    print("\n4. 属性匹配检查:")
    all_properties_match = True
    
    for config_table, db_model in TABLE_MODEL_MAPPING.items():
        if db_model not in db_models:
            continue
        
        config_fields = config_tables[config_table]
        model_id = db_models[db_model]
        db_fields = db_properties.get(model_id, [])
        
        print(f"   \n   检查表 {config_table} -> 模型 {db_model}:")
        print(f"   - config.py字段数: {len(config_fields)}")
        print(f"   - 数据库字段数: {len(db_fields)}")
        
        # 检查是否有缺失的字段
        missing_fields = []
        for field in config_fields:
            if field not in db_fields:
                missing_fields.append(field)
        
        # 检查是否有多余的字段
        extra_fields = []
        for field in db_fields:
            if field not in config_fields:
                extra_fields.append(field)
        
        if missing_fields:
            print(f"   ❌ 缺失字段: {missing_fields}")
            all_properties_match = False
        
        if extra_fields:
            print(f"   ❌ 多余字段: {extra_fields}")
            all_properties_match = False
        
        if not missing_fields and not extra_fields:
            print(f"   ✅ 字段完全匹配")
    
    if all_properties_match:
        print("\n   ✅ 所有表的属性都完全匹配")
    else:
        print("\n   ❌ 存在属性不匹配的表")
    
    # 总结
    print("\n5. 检查总结:")
    if all_models_match and all_properties_match:
        print("   ✅ 数据库模型和属性与config.py完全匹配")
    else:
        print("   ❌ 数据库模型和属性与config.py不完全匹配，请检查上述问题")
    
    print("\n=== 检查完成 ===")

if __name__ == '__main__':
    main()