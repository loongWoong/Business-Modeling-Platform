from utils import get_db_connection, get_current_date

# 获取数据库连接
conn = get_db_connection()

try:
    # 高速收费业务场景的语义/指标数据
    indicators_data = [
        {
            "name": "收费站日车流量",
            "expression": "COUNT(*)",
            "returnType": "number",
            "unit": "辆",
            "description": "统计每个收费站每日的车辆通行数量",
            "status": "published",
            "domainId": 3
        },
        {
            "name": "收费站日均收费额",
            "expression": "AVG(toll_amount)",
            "returnType": "number",
            "unit": "元",
            "description": "计算每个收费站每日的平均收费金额",
            "status": "published",
            "domainId": 3
        },
        {
            "name": "ETC门架日通过量",
            "expression": "COUNT(*)",
            "returnType": "number",
            "unit": "辆",
            "description": "统计每个ETC门架每日的车辆通过数量",
            "status": "published",
            "domainId": 3
        },
        {
            "name": "车辆类型分布",
            "expression": "GROUP BY vehicle_type, COUNT(*) / total * 100",
            "returnType": "number",
            "unit": "%",
            "description": "分析不同类型车辆的通行比例",
            "status": "published",
            "domainId": 3
        },
        {
            "name": "收费站高峰时段流量",
            "expression": "COUNT(*) WHERE hour >= 7 AND hour <= 9 OR hour >= 17 AND hour <= 19",
            "returnType": "number",
            "unit": "辆",
            "description": "统计收费站早高峰和晚高峰的车流量",
            "status": "published",
            "domainId": 3
        },
        {
            "name": "平均通行时间",
            "expression": "AVG(end_time - start_time)",
            "returnType": "number",
            "unit": "秒",
            "description": "计算车辆通过收费路段的平均时间",
            "status": "published",
            "domainId": 3
        },
        {
            "name": "异常车辆比例",
            "expression": "COUNT(*) WHERE is_abnormal = 1 / total * 100",
            "returnType": "number",
            "unit": "%",
            "description": "统计异常车辆占总通行车辆的比例",
            "status": "draft",
            "domainId": 3
        },
        {
            "name": "ETC使用率",
            "expression": "COUNT(*) WHERE payment_method = 'ETC' / total * 100",
            "returnType": "number",
            "unit": "%",
            "description": "计算ETC支付方式的使用率",
            "status": "published",
            "domainId": 3
        },
        {
            "name": "收费车道使用率",
            "expression": "SUM(occupied_time) / (total_lanes * 24 * 3600) * 100",
            "returnType": "number",
            "unit": "%",
            "description": "统计收费车道的使用效率",
            "status": "draft",
            "domainId": 3
        },
        {
            "name": "月度通行量趋势",
            "expression": "COUNT(*) GROUP BY MONTH(pass_time)",
            "returnType": "number",
            "unit": "辆",
            "description": "分析月度通行量的变化趋势",
            "status": "published",
            "domainId": 3
        }
    ]
    
    # 获取当前日期
    current_date = get_current_date()
    
    # 插入数据
    for indicator in indicators_data:
        # 检查是否已存在相同名称的指标
        existing = conn.execute("SELECT * FROM indicators WHERE name = ?", (indicator["name"],)).fetchone()
        if not existing:
            # 获取下一个ID
            next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM indicators").fetchone()[0]
            
            # 插入新指标
            conn.execute(
                "INSERT INTO indicators (id, name, expression, returnType, unit, description, status, domainId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                (next_id, indicator["name"], indicator["expression"], indicator["returnType"], 
                 indicator["unit"], indicator["description"], indicator["status"], 
                 indicator["domainId"], current_date, current_date)
            )
            print(f"成功插入指标: {indicator['name']}")
        else:
            print(f"指标已存在，跳过: {indicator['name']}")
    
    # 提交事务
    conn.commit()
    
    # 查看插入后的数据
    print("\n=== 插入后的指标数据 ===")
    all_indicators = conn.execute("SELECT * FROM indicators ORDER BY id;")
    for row in all_indicators:
        print(row)
        
finally:
    conn.close()