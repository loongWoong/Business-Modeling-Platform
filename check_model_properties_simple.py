import duckdb
import os
import re

# 配置文件路径
CONFIG_PATH = 'c:\\Users\\leon\\Downloads\\trae-build-demo\\testScript\\config.py'
# 数据库路径
DB_PATH = 'c:\\Users\\leon\\Downloads\\trae-build-demo\\backend\\app.data.db'

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
    print(f"\n1. 从config.py中提取了 {len(config_tables)} 个表:")
    for table in config_tables.keys():
        print(f"   - {table}")
    
    # 从数据库读取模型和属性
    db_models, db_properties = get_db_models_and_properties()
    print(f"\n2. 从数据库中读取了 {len(db_models)} 个模型:")
    for model in db_models.keys():
        print(f"   - {model}")
    
    # 检查模型是否匹配
    print("\n3. 模型匹配检查:")
    config_table_names = set(config_tables.keys())
    db_model_names = set(db_models.keys())
    
    # 检查config.py中的表是否都在数据库中存在
    missing_models = config_table_names - db_model_names
    if missing_models:
        print(f"   ❌ 数据库中缺失的模型: {missing_models}")
    else:
        print("   ✅ 所有config.py中的表都在数据库模型中存在")
    
    # 检查数据库中的模型是否都在config.py中存在
    extra_models = db_model_names - config_table_names
    if extra_models:
        print(f"   ❌ 数据库中多余的模型: {extra_models}")
    else:
        print("   ✅ 数据库中的所有模型都在config.py中有对应表")
    
    # 检查属性是否匹配
    print("\n4. 属性匹配检查:")
    all_properties_match = True
    
    for table_name, config_fields in config_tables.items():
        if table_name not in db_models:
            continue
        
        model_id = db_models[table_name]
        db_fields = db_properties.get(model_id, [])
        
        config_field_set = set(config_fields)
        db_field_set = set(db_fields)
        
        # 检查config.py中的字段是否都在数据库中存在
        missing_fields = config_field_set - db_field_set
        # 检查数据库中的字段是否都在config.py中存在
        extra_fields = db_field_set - config_field_set
        
        if missing_fields or extra_fields:
            all_properties_match = False
            print(f"   \n   ❌ 表 {table_name} 的属性不匹配:")
            if missing_fields:
                print(f"      - 缺失的字段: {missing_fields}")
            if extra_fields:
                print(f"      - 多余的字段: {extra_fields}")
        else:
            print(f"   ✅ 表 {table_name} 的属性完全匹配")
    
    if all_properties_match:
        print("\n   ✅ 所有表的属性都完全匹配")
    else:
        print("\n   ❌ 存在属性不匹配的表")
    
    print("\n=== 检查完成 ===")

if __name__ == '__main__':
    main()