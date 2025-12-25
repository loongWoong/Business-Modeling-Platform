from utils import get_db_connection

# 获取数据库连接
conn = get_db_connection()

try:
    # 1. 查看现有模型
    print("=== 现有模型 ===")
    models = conn.execute("SELECT id, name, code FROM models ORDER BY id;")
    models_list = models.fetchall()
    for model in models_list:
        print(f"ID: {model[0]}, 名称: {model[1]}, 编码: {model[2]}")
    
    # 2. 查看现有指标
    print("\n=== 现有指标 ===")
    indicators = conn.execute("SELECT id, name FROM indicators ORDER BY id;")
    indicators_list = indicators.fetchall()
    for indicator in indicators_list:
        print(f"ID: {indicator[0]}, 名称: {indicator[1]}")
    
    # 3. 根据业务场景绑定指标到模型
    print("\n=== 绑定指标到模型 ===")
    
    # 定义模型-指标绑定关系
    # 格式: (模型ID, 指标ID)
    model_indicator_bindings = [
        # 收费站相关指标
        (3, 2),  # 收费站 - 收费站日车流量
        (3, 3),  # 收费站 - 收费站日均收费额
        (3, 6),  # 收费站 - 收费站高峰时段流量
        
        # ETC门架相关指标
        (4, 4),  # ETC门架 - ETC门架日通过量
        
        # 收费公路相关指标
        (2, 7),  # 收费公路 - 平均通行时间
        (2, 9),  # 收费公路 - ETC使用率
        (2, 10), # 收费公路 - 月度通行量趋势
        
        # 多种模型通用指标
        (2, 5),  # 收费公路 - 车辆类型分布
        (3, 5),  # 收费站 - 车辆类型分布
        (4, 5),  # ETC门架 - 车辆类型分布
        
        (2, 8),  # 收费公路 - 异常车辆比例
        (3, 8),  # 收费站 - 异常车辆比例
        (4, 8),  # ETC门架 - 异常车辆比例
        
        (3, 11), # 收费站 - 收费车道使用率
    ]
    
    # 执行绑定
    for model_id, indicator_id in model_indicator_bindings:
        # 检查是否已存在绑定
        existing = conn.execute(
            "SELECT * FROM model_indicators WHERE modelId = ? AND indicatorId = ?", 
            (model_id, indicator_id)
        ).fetchone()
        
        if not existing:
            # 插入绑定关系
            conn.execute(
                "INSERT INTO model_indicators (modelId, indicatorId) VALUES (?, ?)",
                (model_id, indicator_id)
            )
            # 获取模型和指标名称用于输出
            model_name = next((m[1] for m in models_list if m[0] == model_id), f"模型{model_id}")
            indicator_name = next((i[1] for i in indicators_list if i[0] == indicator_id), f"指标{indicator_id}")
            print(f"成功绑定: {model_name} -> {indicator_name}")
        else:
            model_name = next((m[1] for m in models_list if m[0] == model_id), f"模型{model_id}")
            indicator_name = next((i[1] for i in indicators_list if i[0] == indicator_id), f"指标{indicator_id}")
            print(f"绑定已存在，跳过: {model_name} -> {indicator_name}")
    
    # 提交事务
    conn.commit()
    
    # 4. 验证绑定结果
    print("\n=== 绑定结果验证 ===")
    bindings = conn.execute("SELECT mi.modelId, m.name as modelName, mi.indicatorId, i.name as indicatorName FROM model_indicators mi JOIN models m ON mi.modelId = m.id JOIN indicators i ON mi.indicatorId = i.id ORDER BY mi.modelId, mi.indicatorId;")
    binding_results = bindings.fetchall()
    
    print(f"总共绑定 {len(binding_results)} 个指标-模型关系")
    for binding in binding_results:
        print(f"模型: {binding[1]} -> 指标: {binding[3]}")
        
finally:
    conn.close()