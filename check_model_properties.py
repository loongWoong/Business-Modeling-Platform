import duckdb
import os
import re

# 配置文件路径
CONFIG_PATH = 'c:\\Users\\leon\\Downloads\\trae-build-demo\\testScript\\config.py'
# 数据库路径
DB_PATH = 'c:\\Users\\leon\\Downloads\\trae-build-demo\\backend\\app.data.db'

# 将驼峰命名转换为下划线命名
def camel_to_snake(name):
    # 处理特殊字段
    special_cases = {
        'VIN': 'vin',
        'HDVUID': 'hdv_uid',
        'HDVModel': 'hdv_model',
        'HDVID': 'hdv_id',
        'VPLRUID': 'vplr_uid',
        'VPLRModel': 'vplr_model',
        'VPLRID': 'vplr_id',
        'VPLRManUID': 'vplr_man_uid',
        'etcGantryHex': 'etc_gantry_hex',
        'reEtcGantryHex': 're_etc_gantry_hex'
    }
    
    if name in special_cases:
        return special_cases[name]
    
    snake = ''
    for i, char in enumerate(name):
        if char.isupper() and i > 0:
            # 处理连续大写字母的情况
            if i+1 < len(name) and name[i+1].islower():
                snake += '_' + char.lower()
            elif i == 1 and name[0].isupper():
                # 处理两个连续大写字母开头的情况
                snake = snake.lower() + '_' + char.lower()
            else:
                snake += char.lower()
        else:
            snake += char.lower()
    return snake

# 从config.py中提取表结构
def extract_tables_from_config(config_path):
    with open(config_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    tables = {}
    # 匹配CREATE TABLE语句
    table_pattern = re.compile(r'CREATE TABLE IF NOT EXISTS (\w+) \(([^\)]+)\)', re.DOTALL)
    table_matches = table_pattern.findall(content)
    
    for table_name, table_content in table_matches:
        # 提取字段信息
        fields = []
        field_pattern = re.compile(r'\s*(\w+)\s+(\w+)', re.MULTILINE)
        field_matches = field_pattern.findall(table_content)
        
        for field_name, field_type in field_matches:
            # 跳过PRIMARY KEY等约束
            if field_name.upper() not in ['PRIMARY', 'KEY']:
                fields.append(field_name)
        
        # 同时保存驼峰命名和下划线命名的表名
        tables[table_name.lower()] = fields
        # 添加下划线命名的映射
        snake_name = camel_to_snake(table_name)
        if snake_name != table_name.lower():
            tables[snake_name] = fields
    
    # 处理特殊映射
    special_mappings = {
        'transaction': 'transaction_record',
        'tollroad': 'toll_road',
        'sectionowner': 'road_owner',
        'tollstation': 'toll_station',
        'tollplaza': 'toll_plaza',
        'tollgantry': 'etc_gantry',
        'tollinterval': 'toll_unit',
        'tolllane': 'lane',
        'path': 'vehicle_path',
        'restorepath': 'fitted_path',
        'splitdetail': 'split_detail'
    }
    
    for camel_name, snake_name in special_mappings.items():
        if camel_name in tables:
            tables[snake_name] = tables[camel_name]
    
    return tables

# 从数据库中读取模型和属性
def get_models_and_properties(db_path):
    conn = duckdb.connect(db_path)
    
    # 读取models表
    models_df = conn.execute('SELECT id, code FROM models').fetchdf()
    models = {row['code'].lower(): row['id'] for _, row in models_df.iterrows()}
    
    # 读取properties表
    properties_df = conn.execute('SELECT modelId, code FROM properties').fetchdf()
    properties = {}
    for model_id, code in zip(properties_df['modelId'], properties_df['code']):
        if model_id not in properties:
            properties[model_id] = []
        properties[model_id].append(code.lower())
    
    conn.close()
    return models, properties

# 比较config.py与数据库中的模型和属性
def compare_models_and_properties():
    # 提取config.py中的表结构
    config_tables = extract_tables_from_config(CONFIG_PATH)
    print(f"从config.py中提取了 {len(config_tables)} 个表")
    
    # 从数据库中读取模型和属性
    db_models, db_properties = get_models_and_properties(DB_PATH)
    print(f"从数据库中读取了 {len(db_models)} 个模型")
    
    # 比较模型
    print("\n=== 模型比较结果 ===")
    config_table_names = set(config_tables.keys())
    db_model_names = set(db_models.keys())
    
    # 检查config.py中的表是否都在数据库中有对应模型
    missing_in_db = []
    for table_name in config_tables.keys():
        # 只检查原始表名（非映射名）
        if not any(table_name in mapping for mapping in ['toll_road', 'marker_point', 'transaction_record', 'etc_gantry', 'toll_unit', 'fitted_path', 'lane', 'vehicle_path', 'road_owner', 'toll_station', 'split_detail']):
            snake_name = camel_to_snake(table_name)
            if table_name not in db_model_names and snake_name not in db_model_names:
                missing_in_db.append(table_name)
    
    if missing_in_db:
        print(f"数据库中缺失的模型: {missing_in_db}")
    else:
        print("✓ 所有config.py中的表都已在models表中建模")
    
    # 检查数据库中的模型是否都在config.py中有对应表
    extra_in_db = []
    for model_name in db_model_names:
        if model_name not in config_table_names:
            extra_in_db.append(model_name)
    
    if extra_in_db:
        print(f"数据库中多余的模型: {extra_in_db}")
    else:
        print("✓ 数据库中的所有模型都在config.py中有对应表")
    
    # 比较每个模型的属性
    print("\n=== 属性比较结果 ===")
    all_fields_match = True
    
    # 原始表名与数据库模型名的映射
    table_model_mapping = {
        'Vehicle': 'vehicle',
        'Medium': 'medium',
        'Transaction': 'transaction_record',
        'TollRoad': 'toll_road',
        'SectionOwner': 'road_owner',
        'Section': 'section',
        'TollStation': 'toll_station',
        'TollPlaza': 'toll_plaza',
        'TollLane': 'lane',
        'TollInterval': 'toll_unit',
        'TollGantry': 'etc_gantry',
        'Path': 'vehicle_path',
        'RestorePath': 'fitted_path',
        'SplitDetail': 'split_detail'
    }
    
    for original_table_name, model_name in table_model_mapping.items():
        if model_name not in db_models:
            print(f"\n模型 {model_name} 不存在于数据库中")
            all_fields_match = False
            continue
        
        model_id = db_models[model_name]
        config_fields = config_tables[original_table_name.lower()]
        db_fields = db_properties.get(model_id, [])
        
        # 转换字段名为统一格式进行比较（转为下划线命名）
        config_fields_snake = {camel_to_snake(field) for field in config_fields}
        db_fields_snake = set(db_fields)
        
        # 缺失的字段
        missing_fields = config_fields_snake - db_fields_snake
        # 多余的字段
        extra_fields = db_fields_snake - config_fields_snake
        
        if missing_fields or extra_fields:
            all_fields_match = False
            print(f"\n表 {original_table_name} (模型: {model_name}) 的属性不匹配:")
            if missing_fields:
                print(f"  缺失的属性: {missing_fields}")
            if extra_fields:
                print(f"  多余的属性: {extra_fields}")
        else:
            print(f"\n✓ 表 {original_table_name} (模型: {model_name}) 的属性完全匹配")
    
    if all_fields_match:
        print("\n✓ 所有表的属性都完全匹配")
    else:
        print("\n✗ 存在属性不匹配的表")

# 执行比较
if __name__ == '__main__':
    compare_models_and_properties()