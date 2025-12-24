import duckdb
import json
import os

# 获取当前脚本所在目录
script_dir = os.path.dirname(os.path.abspath(__file__))

# 定义数据库路径
DB_PATH = os.path.join(script_dir, 'app.data.db')

# 定义演示数据（从app.py中复制的mock_data）
mock_data = {
    "domains": [
        {"id": 3, "name": "路网设施域", "description": "管理高速公路路网设施", "owner": "路段管理部", "updatedAt": "2025-12-22"}
    ],
    "domain_edges": [],
    "models": [
        # 路网设施域核心模型
        {"id": 1, "name": "路段业主", "code": "road_owner", "description": "高速公路路段业主", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 2, "name": "收费公路", "code": "toll_road", "description": "收费公路信息", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 3, "name": "收费站", "code": "toll_station", "description": "收费站信息", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 4, "name": "ETC门架", "code": "etc_gantry", "description": "ETC门架信息", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 5, "name": "收费单元", "code": "toll_unit", "description": "收费单元信息", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 6, "name": "车道", "code": "lane", "description": "收费站车道信息", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 7, "name": "标识点", "code": "marker_point", "description": "路径标识点", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        
        # 关联模型（为了完整展示关系）
        {"id": 8, "name": "车辆", "code": "vehicle", "description": "车辆基本信息", "creator": "车辆管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 9, "name": "通行介质", "code": "pass_medium", "description": "车辆通行介质", "creator": "车辆管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 10, "name": "交易流水", "code": "transaction_record", "description": "车辆交易流水记录", "creator": "收费管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 11, "name": "车辆通行路径", "code": "vehicle_path", "description": "车辆实际通行路径", "creator": "路径管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 12, "name": "通行拟合路径", "code": "fitted_path", "description": "拟合后的通行路径", "creator": "路径管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 13, "name": "拆分明细", "code": "split_detail", "description": "交易拆分详情", "creator": "收费管理部", "updatedAt": "2025-12-22", "domainId": 3}
    ],
    "model_edges": [
        # 车辆 - 通行介质
        {"source": 8, "target": 9},
        # 车辆 - 交易流水
        {"source": 8, "target": 10},
        # 路段业主 - 收费公路
        {"source": 1, "target": 2},
        # 收费公路 - 收费站
        {"source": 2, "target": 3},
        # 收费公路 - ETC门架
        {"source": 2, "target": 4},
        # 收费公路 - 收费单元
        {"source": 2, "target": 5},
        # ETC门架 - 收费单元
        {"source": 4, "target": 5},
        # 收费站 - 车道
        {"source": 3, "target": 6},
        # ETC门架 - 标识点
        {"source": 4, "target": 7},
        # 车道 - 标识点
        {"source": 6, "target": 7},
        # 标识点 - 交易流水
        {"source": 7, "target": 10},
        # 交易流水 - 车辆通行路径
        {"source": 10, "target": 11},
        # 车辆通行路径 - 通行拟合路径
        {"source": 11, "target": 12},
        # 通行拟合路径 - 拆分明细
        {"source": 12, "target": 13},
        # 收费单元 - 拆分明细
        {"source": 5, "target": 13}
    ],
    "properties": [
        # 路段业主属性
        {"id": 1, "name": "业主ID", "code": "owner_id", "type": "string", "required": True, "description": "路段业主唯一标识", "modelId": 1, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "owner_id"},
        {"id": 2, "name": "业主名称", "code": "owner_name", "type": "string", "required": True, "description": "路段业主名称", "modelId": 1, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "owner_name"},
        {"id": 3, "name": "联系方式", "code": "contact_info", "type": "string", "required": True, "description": "业主联系方式", "modelId": 1, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "private", "maskRule": "phone_middle_4", "physicalColumn": "contact_info"},
        
        # 收费公路属性
        {"id": 4, "name": "公路ID", "code": "road_id", "type": "string", "required": True, "description": "收费公路唯一标识", "modelId": 2, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_id"},
        {"id": 5, "name": "公路名称", "code": "road_name", "type": "string", "required": True, "description": "收费公路名称", "modelId": 2, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_name"},
        {"id": 6, "name": "所属业主", "code": "owner_id", "type": "string", "required": True, "description": "所属路段业主ID", "modelId": 2, "isPrimaryKey": False, "isForeignKey": True, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "owner_id", "foreignKeyTable": "owner", "foreignKeyColumn": "owner_id"},
        {"id": 7, "name": "公路等级", "code": "road_level", "type": "string", "required": True, "description": "公路等级", "modelId": 2, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(高速, 国道, 省道)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_level"},
        {"id": 8, "name": "起始里程", "code": "start_mileage", "type": "number", "required": True, "description": "起始里程", "modelId": 2, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "MIN(0)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "start_mileage"},
        {"id": 9, "name": "结束里程", "code": "end_mileage", "type": "number", "required": True, "description": "结束里程", "modelId": 2, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "MIN(0)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "end_mileage"},
        
        # 收费站属性
        {"id": 10, "name": "收费站ID", "code": "station_id", "type": "string", "required": True, "description": "收费站唯一标识", "modelId": 3, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "station_id"},
        {"id": 11, "name": "收费站名称", "code": "station_name", "type": "string", "required": True, "description": "收费站名称", "modelId": 3, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "station_name"},
        {"id": 12, "name": "所属公路", "code": "road_id", "type": "string", "required": True, "description": "所属收费公路ID", "modelId": 3, "isPrimaryKey": False, "isForeignKey": True, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_id", "foreignKeyTable": "road", "foreignKeyColumn": "road_id"},
        {"id": 13, "name": "收费站类型", "code": "station_type", "type": "string", "required": True, "description": "收费站类型", "modelId": 3, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(主线站, 匝道站)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "station_type"},
        
        # ETC门架属性
        {"id": 14, "name": "门架ID", "code": "gantry_id", "type": "string", "required": True, "description": "ETC门架唯一标识", "modelId": 4, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "gantry_id"},
        {"id": 15, "name": "门架名称", "code": "gantry_name", "type": "string", "required": True, "description": "ETC门架名称", "modelId": 4, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "gantry_name"},
        {"id": 16, "name": "所属公路", "code": "road_id", "type": "string", "required": True, "description": "所属收费公路ID", "modelId": 4, "isPrimaryKey": False, "isForeignKey": True, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_id", "foreignKeyTable": "road", "foreignKeyColumn": "road_id"},
        {"id": 17, "name": "门架位置", "code": "gantry_location", "type": "string", "required": True, "description": "门架位置", "modelId": 4, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "gantry_location"},
        {"id": 18, "name": "门架状态", "code": "gantry_status", "type": "string", "required": True, "description": "门架运行状态", "modelId": 4, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": "正常", "constraints": ["IN(正常, 故障, 维护)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "gantry_status"},
        
        # 收费单元属性
        {"id": 19, "name": "收费单元ID", "code": "toll_unit_id", "type": "string", "required": True, "description": "收费单元唯一标识", "modelId": 5, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "toll_unit_id"},
        {"id": 20, "name": "收费单元名称", "code": "toll_unit_name", "type": "string", "required": True, "description": "收费单元名称", "modelId": 5, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "toll_unit_name"},
        {"id": 21, "name": "所属公路", "code": "road_id", "type": "string", "required": True, "description": "所属收费公路ID", "modelId": 5, "isPrimaryKey": False, "isForeignKey": True, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_id", "foreignKeyTable": "road", "foreignKeyColumn": "road_id"},
        {"id": 22, "name": "收费类型", "code": "toll_type", "type": "string", "required": True, "description": "收费类型", "modelId": 5, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(ETC, 人工, 混合)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "toll_type"},
        
        # 车道属性
        {"id": 23, "name": "车道ID", "code": "lane_id", "type": "string", "required": True, "description": "车道唯一标识", "modelId": 6, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "lane_id"},
        {"id": 24, "name": "车道编号", "code": "lane_number", "type": "string", "required": True, "description": "车道编号", "modelId": 6, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "lane_number"},
        {"id": 25, "name": "所属收费站", "code": "station_id", "type": "string", "required": True, "description": "所属收费站ID", "modelId": 6, "isPrimaryKey": False, "isForeignKey": True, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "station_id", "foreignKeyTable": "toll_station", "foreignKeyColumn": "station_id"},
        {"id": 26, "name": "车道类型", "code": "lane_type", "type": "string", "required": True, "description": "车道类型（ETC、人工等）", "modelId": 6, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(ETC, 人工, 混合)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "lane_type"},
        {"id": 27, "name": "车道状态", "code": "lane_status", "type": "string", "required": True, "description": "车道运行状态", "modelId": 6, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": "正常", "constraints": ["IN(正常, 故障, 关闭)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "lane_status"},
        
        # 标识点属性
        {"id": 28, "name": "标识点ID", "code": "marker_id", "type": "string", "required": True, "description": "标识点唯一标识", "modelId": 7, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "marker_id"},
        {"id": 29, "name": "标识点名称", "code": "marker_name", "type": "string", "required": True, "description": "标识点名称", "modelId": 7, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "marker_name"},
        {"id": 30, "name": "经度", "code": "longitude", "type": "number", "required": True, "description": "标识点经度", "modelId": 7, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "BETWEEN(-180, 180)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "longitude"},
        {"id": 31, "name": "纬度", "code": "latitude", "type": "number", "required": True, "description": "标识点纬度", "modelId": 7, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "BETWEEN(-90, 90)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "latitude"},
        {"id": 32, "name": "标识点类型", "code": "marker_type", "type": "string", "required": True, "description": "标识点类型", "modelId": 7, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(入口, 出口, 中间点)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "marker_type"},
        
        # 车辆属性
        {"id": 33, "name": "车辆ID", "code": "vehicle_id", "type": "string", "required": True, "description": "车辆唯一标识", "modelId": 8, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "vehicle_id"},
        {"id": 34, "name": "车牌号", "code": "license_plate", "type": "string", "required": True, "description": "车辆牌照号码", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "license_plate"},
        {"id": 35, "name": "车型", "code": "vehicle_type", "type": "string", "required": True, "description": "车辆类型", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(小型客车, 大型客车, 小型货车, 大型货车, 中型客车)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "vehicle_type"},
        {"id": 36, "name": "车主姓名", "code": "owner_name", "type": "string", "required": True, "description": "车辆所有人姓名", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "private", "maskRule": "name_last_char", "physicalColumn": "owner_name"},
        {"id": 37, "name": "车主身份证号", "code": "owner_id_card", "type": "string", "required": False, "description": "车主身份证号码", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["LENGTH(18)"], "sensitivityLevel": "private", "maskRule": "id_card_middle_8", "physicalColumn": "owner_id_card"},
        {"id": 38, "name": "车辆颜色", "code": "vehicle_color", "type": "string", "required": False, "description": "车辆颜色", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": [], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "vehicle_color"},
        {"id": 39, "name": "注册日期", "code": "register_date", "type": "date", "required": False, "description": "车辆注册日期", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": [], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "register_date"},
        {"id": 40, "name": "车辆状态", "code": "vehicle_status", "type": "string", "required": True, "description": "车辆状态", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": "正常", "constraints": ["IN(正常, 注销, 报废, 查封)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "vehicle_status"}
    ],
    # 关系数据 - 使用sourceModelId和targetModelId实现规范化
    "relations": [
        {"id": 1, "name": "持有", "sourceModelId": 8, "targetModelId": 9, "type": "one-to-many", "description": "车辆持有多个通行介质", "enabled": True},
        {"id": 2, "name": "关联", "sourceModelId": 8, "targetModelId": 10, "type": "one-to-many", "description": "车辆关联多个交易流水", "enabled": True},
        {"id": 3, "name": "管理", "sourceModelId": 1, "targetModelId": 2, "type": "one-to-many", "description": "路段业主管理多个收费公路", "enabled": True},
        {"id": 4, "name": "包含", "sourceModelId": 2, "targetModelId": 3, "type": "one-to-many", "description": "收费公路包含多个收费站", "enabled": True},
        {"id": 5, "name": "包含", "sourceModelId": 2, "targetModelId": 4, "type": "one-to-many", "description": "收费公路包含多个ETC门架", "enabled": True},
        {"id": 6, "name": "包含", "sourceModelId": 2, "targetModelId": 5, "type": "one-to-many", "description": "收费公路包含多个收费单元", "enabled": True},
        {"id": 7, "name": "代收", "sourceModelId": 4, "targetModelId": 5, "type": "one-to-many", "description": "ETC门架代收多个收费单元", "enabled": True},
        {"id": 8, "name": "包含", "sourceModelId": 3, "targetModelId": 6, "type": "one-to-many", "description": "收费站包含多个车道", "enabled": True},
        {"id": 9, "name": "继承", "sourceModelId": 4, "targetModelId": 7, "type": "one-to-one", "description": "ETC门架对应一个标识点", "enabled": True},
        {"id": 10, "name": "继承", "sourceModelId": 6, "targetModelId": 7, "type": "one-to-one", "description": "车道对应一个标识点", "enabled": True},
        {"id": 11, "name": "生成", "sourceModelId": 7, "targetModelId": 10, "type": "one-to-many", "description": "标识点生成多个交易流水", "enabled": True},
        {"id": 12, "name": "汇聚为", "sourceModelId": 10, "targetModelId": 11, "type": "many-to-one", "description": "多个交易流水汇聚为一个车辆通行路径", "enabled": True},
        {"id": 13, "name": "拟合为", "sourceModelId": 11, "targetModelId": 12, "type": "one-to-one", "description": "车辆通行路径拟合为一个通行拟合路径", "enabled": True},
        {"id": 14, "name": "拆分为", "sourceModelId": 12, "targetModelId": 13, "type": "one-to-many", "description": "通行拟合路径拆分为多个拆分明细", "enabled": True},
        {"id": 15, "name": "关联", "sourceModelId": 5, "targetModelId": 13, "type": "one-to-one", "description": "收费单元关联一个拆分明细", "enabled": True}
    ],
    
    # 共享属性数据
    "shared_attributes": [
        {"id": 1, "name": "创建时间", "type": "datetime", "length": None, "precision": None, "description": "记录创建时间", "valueRange": None, "domainId": 3, "referenceCount": 5},
        {"id": 2, "name": "更新时间", "type": "datetime", "length": None, "precision": None, "description": "记录更新时间", "valueRange": None, "domainId": 3, "referenceCount": 5},
        {"id": 3, "name": "状态", "type": "string", "length": "20", "precision": None, "description": "记录状态", "valueRange": "有效,无效", "domainId": 3, "referenceCount": 3},
        {"id": 4, "name": "备注", "type": "text", "length": None, "precision": None, "description": "备注信息", "valueRange": None, "domainId": 3, "referenceCount": 2},
        {"id": 5, "name": "排序号", "type": "number", "length": None, "precision": "0", "description": "排序序号", "valueRange": None, "domainId": 3, "referenceCount": 4}
    ],
    
    # 语义指标数据
    "indicators": [
        {"id": 1, "name": "平均通行费用", "expression": "SUM(账单金额)/COUNT(通行记录)", "returnType": "number", "unit": "元", "description": "计算平均通行费用", "status": "published", "domainId": 3, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        {"id": 2, "name": "路段车流量", "expression": "COUNT(通行记录 WHERE 路段ID=?)", "returnType": "number", "unit": "辆", "description": "计算路段车流量", "status": "draft", "domainId": 3, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        {"id": 3, "name": "车型占比", "expression": "COUNT(车辆信息 WHERE 车型=?)/COUNT(车辆信息)", "returnType": "number", "unit": "%", "description": "计算车型占比", "status": "published", "domainId": 3, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        {"id": 4, "name": "收费站日均收入", "expression": "SUM(账单金额 WHERE 收费站ID=?)/COUNT(DISTINCT 日期)", "returnType": "number", "unit": "元", "description": "计算收费站日均收入", "status": "draft", "domainId": 3, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        {"id": 5, "name": "通行时间", "expression": "结束时间 - 开始时间", "returnType": "time", "unit": "分钟", "description": "计算通行时间", "status": "published", "domainId": 3, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"}
    ],
    
    # 数据源数据
    "datasources": [
        # 路段业主数据源
        {"id": 1, "name": "路段业主MySQL", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_road_owner", "status": "active", "description": "路段业主信息表", "modelId": 1, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 收费公路数据源
        {"id": 2, "name": "收费公路MySQL", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_toll_road", "status": "active", "description": "收费公路信息表", "modelId": 2, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 收费站数据源
        {"id": 3, "name": "收费站MySQL", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_toll_station", "status": "active", "description": "收费站信息表", "modelId": 3, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        {"id": 15, "name": "收费站Oracle", "type": "oracle", "url": "jdbc:oracle:thin:@localhost:1521:ORCL", "tableName": "toll_station_history", "status": "active", "description": "收费站历史数据表", "modelId": 3, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # ETC门架数据源
        {"id": 4, "name": "ETC门架MySQL", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_etc_gantry", "status": "active", "description": "ETC门架信息表", "modelId": 4, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 收费单元数据源
        {"id": 5, "name": "收费单元MySQL", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_toll_unit", "status": "active", "description": "收费单元信息表", "modelId": 5, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 车道数据源
        {"id": 6, "name": "车道MySQL", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_lane", "status": "active", "description": "车道信息表", "modelId": 6, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 标识点数据源
        {"id": 7, "name": "标识点MySQL", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_marker_point", "status": "active", "description": "标识点信息表", "modelId": 7, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 车辆数据源
        {"id": 8, "name": "车辆MySQL", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_vehicle", "status": "active", "description": "车辆信息表", "modelId": 8, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 通行介质数据源
        {"id": 9, "name": "通行介质MySQL", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_pass_medium", "status": "active", "description": "通行介质信息表", "modelId": 9, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 交易流水数据源
        {"id": 10, "name": "交易流水Oracle", "type": "oracle", "url": "jdbc:oracle:thin:@localhost:1521:ORCL", "tableName": "t_transaction_record", "status": "active", "description": "交易流水记录表", "modelId": 10, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        {"id": 11, "name": "交易流水Kafka", "type": "kafka", "url": "localhost:9092", "tableName": "transaction_events", "status": "active", "description": "交易流水事件流", "modelId": 10, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 车辆通行路径数据源
        {"id": 12, "name": "车辆通行路径PostgreSQL", "type": "postgresql", "url": "jdbc:postgresql://localhost:5432/expressway", "tableName": "t_vehicle_path", "status": "active", "description": "车辆通行路径表", "modelId": 11, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 通行拟合路径数据源
        {"id": 13, "name": "通行拟合路径PostgreSQL", "type": "postgresql", "url": "jdbc:postgresql://localhost:5432/expressway", "tableName": "t_fitted_path", "status": "active", "description": "通行拟合路径表", "modelId": 12, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        # 拆分明细数据源
        {"id": 14, "name": "拆分明细MySQL", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_split_detail", "status": "active", "description": "拆分明细表", "modelId": 13, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"}
    ],
    
    # 模型绑定的指标
    "model_indicators": [
        {"modelId": 10, "indicatorId": 1},
        {"modelId": 3, "indicatorId": 4}
    ],
    
    # 函数数据
    "functions": [
        {
            "id": 1,
            "name": "createCard",
            "description": "创建新的卡片",
            "code": "function createCard(data) { return { id: Date.now(), ...data, status: 'active' }; }",
            "inputSchema": {"type": "object", "properties": {"cardNo": {"type": "string"}, "holderName": {"type": "string"}}},
            "returnType": "object",
            "version": "1.0.0",
            "metadata": {"author": "admin", "createdAt": "2025-12-22"},
            "domainId": 3,
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 2,
            "name": "rechargeCard",
            "description": "为卡片充值",
            "code": "function rechargeCard(data) { return { id: data.id, balance: (data.balance || 0) + data.amount }; }",
            "inputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "amount": {"type": "number"}}},
            "returnType": "object",
            "version": "1.0.0",
            "metadata": {"author": "admin", "createdAt": "2025-12-22"},
            "domainId": 3,
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 3,
            "name": "reportCardLost",
            "description": "挂失卡片",
            "code": "function reportCardLost(data) { return { id: data.id, status: 'lost', lostAt: new Date().toISOString() }; }",
            "inputSchema": {"type": "object", "properties": {"id": {"type": "string"}}},
            "returnType": "object",
            "version": "1.0.0",
            "metadata": {"author": "admin", "createdAt": "2025-12-22"},
            "domainId": 3,
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 4,
            "name": "syncBlacklist",
            "description": "同步黑名单",
            "code": "function syncBlacklist(data) { return { success: true, count: data.ids.length, syncedAt: new Date().toISOString() }; }",
            "inputSchema": {"type": "object", "properties": {"ids": {"type": "array", "items": {"type": "string"}}}},
            "returnType": "object",
            "version": "1.0.0",
            "metadata": {"author": "admin", "createdAt": "2025-12-22"},
            "domainId": 3,
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 5,
            "name": "generateTransaction",
            "description": "生成交易记录",
            "code": "function generateTransaction(data) { return { id: Date.now(), ...data, timestamp: new Date().toISOString(), status: 'completed' }; }",
            "inputSchema": {"type": "object", "properties": {"vehicleId": {"type": "string"}, "cardId": {"type": "string"}, "amount": {"type": "number"}, "startMarkerId": {"type": "string"}, "endMarkerId": {"type": "string"}}},
            "returnType": "object",
            "version": "1.0.0",
            "metadata": {"author": "admin", "createdAt": "2025-12-22"},
            "domainId": 3,
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 6,
            "name": "generateVehiclePath",
            "description": "生成车辆通行路径",
            "code": "function generateVehiclePath(data) { return { id: Date.now(), ...data, generatedAt: new Date().toISOString() }; }",
            "inputSchema": {"type": "object", "properties": {"vehicleId": {"type": "string"}, "transactionIds": {"type": "array", "items": {"type": "string"}}}},
            "returnType": "object",
            "version": "1.0.0",
            "metadata": {"author": "admin", "createdAt": "2025-12-22"},
            "domainId": 3,
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 7,
            "name": "generateFittedPath",
            "description": "生成通行拟合路径",
            "code": "function generateFittedPath(data) { return { id: Date.now(), ...data, fittedAt: new Date().toISOString() }; }",
            "inputSchema": {"type": "object", "properties": {"vehiclePathId": {"type": "string"}}},
            "returnType": "object",
            "version": "1.0.0",
            "metadata": {"author": "admin", "createdAt": "2025-12-22"},
            "domainId": 3,
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 8,
            "name": "generateSplitDetails",
            "description": "生成拆分明细",
            "code": "function generateSplitDetails(data) { return { id: Date.now(), ...data, splitAt: new Date().toISOString() }; }",
            "inputSchema": {"type": "object", "properties": {"fittedPathId": {"type": "string"}}},
            "returnType": "object",
            "version": "1.0.0",
            "metadata": {"author": "admin", "createdAt": "2025-12-22"},
            "domainId": 3,
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 9,
            "name": "registerVehicle",
            "description": "注册车辆信息",
            "code": "function registerVehicle(data) { return { id: Date.now(), ...data, status: 'active' }; }",
            "inputSchema": {"type": "object", "properties": {"licensePlate": {"type": "string"}, "vehicleType": {"type": "string"}, "ownerName": {"type": "string"}}},
            "returnType": "object",
            "version": "1.0.0",
            "metadata": {"author": "admin", "createdAt": "2025-12-22"},
            "domainId": 3,
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 10,
            "name": "updateVehicleInfo",
            "description": "更新车辆信息",
            "code": "function updateVehicleInfo(data) { return { ...data, updatedAt: new Date().toISOString() }; }",
            "inputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "licensePlate": {"type": "string"}, "vehicleType": {"type": "string"}, "ownerName": {"type": "string"}}},
            "returnType": "object",
            "version": "1.0.0",
            "metadata": {"author": "admin", "createdAt": "2025-12-22"},
            "domainId": 3,
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        }
    ],
    
    # 操作类型数据
    "action_types": [
        {
            "id": 1,
            "name": "发卡",
            "description": "创建新的卡片实例",
            "targetObjectTypeId": 9,  # 通行介质
            "inputSchema": {"type": "object", "properties": {"cardNo": {"type": "string"}, "holderName": {"type": "string"}}},
            "outputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "cardNo": {"type": "string"}, "status": {"type": "string"}}},
            "requiresApproval": False,
            "handlerFunction": "createCard",
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 2,
            "name": "充值",
            "description": "为卡片充值",
            "targetObjectTypeId": 9,  # 通行介质
            "inputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "amount": {"type": "number"}}},
            "outputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "balance": {"type": "number"}}},
            "requiresApproval": False,
            "handlerFunction": "rechargeCard",
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 3,
            "name": "挂失",
            "description": "挂失卡片",
            "targetObjectTypeId": 9,  # 通行介质
            "inputSchema": {"type": "object", "properties": {"id": {"type": "string"}}},
            "outputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "status": {"type": "string"}, "lostAt": {"type": "string"}}},
            "requiresApproval": False,
            "handlerFunction": "reportCardLost",
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 4,
            "name": "黑名单同步",
            "description": "同步黑名单信息",
            "targetObjectTypeId": 9,  # 通行介质
            "inputSchema": {"type": "object", "properties": {"ids": {"type": "array", "items": {"type": "string"}}}},
            "outputSchema": {"type": "object", "properties": {"success": {"type": "boolean"}, "count": {"type": "number"}, "syncedAt": {"type": "string"}}},
            "requiresApproval": False,
            "handlerFunction": "syncBlacklist",
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 5,
            "name": "交易记录生成",
            "description": "生成车辆交易记录",
            "targetObjectTypeId": 10,  # 交易流水
            "inputSchema": {"type": "object", "properties": {"vehicleId": {"type": "string"}, "cardId": {"type": "string"}, "amount": {"type": "number"}, "startMarkerId": {"type": "string"}, "endMarkerId": {"type": "string"}}},
            "outputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "vehicleId": {"type": "string"}, "cardId": {"type": "string"}, "amount": {"type": "number"}, "timestamp": {"type": "string"}, "status": {"type": "string"}}},
            "requiresApproval": False,
            "handlerFunction": "generateTransaction",
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 6,
            "name": "通行路径生成",
            "description": "生成车辆通行路径",
            "targetObjectTypeId": 11,  # 车辆通行路径
            "inputSchema": {"type": "object", "properties": {"vehicleId": {"type": "string"}, "transactionIds": {"type": "array", "items": {"type": "string"}}}},
            "outputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "vehicleId": {"type": "string"}, "transactionIds": {"type": "array", "items": {"type": "string"}}, "generatedAt": {"type": "string"}}},
            "requiresApproval": False,
            "handlerFunction": "generateVehiclePath",
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 7,
            "name": "拟合路径生成",
            "description": "生成通行拟合路径",
            "targetObjectTypeId": 12,  # 通行拟合路径
            "inputSchema": {"type": "object", "properties": {"vehiclePathId": {"type": "string"}}},
            "outputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "vehiclePathId": {"type": "string"}, "fittedAt": {"type": "string"}}},
            "requiresApproval": False,
            "handlerFunction": "generateFittedPath",
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 8,
            "name": "拆分明细生成",
            "description": "生成拆分明细",
            "targetObjectTypeId": 13,  # 拆分明细
            "inputSchema": {"type": "object", "properties": {"fittedPathId": {"type": "string"}}},
            "outputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "fittedPathId": {"type": "string"}, "splitAt": {"type": "string"}}},
            "requiresApproval": False,
            "handlerFunction": "generateSplitDetails",
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 9,
            "name": "车辆注册",
            "description": "注册车辆信息",
            "targetObjectTypeId": 8,  # 车辆
            "inputSchema": {"type": "object", "properties": {"licensePlate": {"type": "string"}, "vehicleType": {"type": "string"}, "ownerName": {"type": "string"}}},
            "outputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "licensePlate": {"type": "string"}, "vehicleType": {"type": "string"}, "ownerName": {"type": "string"}, "status": {"type": "string"}}},
            "requiresApproval": False,
            "handlerFunction": "registerVehicle",
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        },
        {
            "id": 10,
            "name": "车辆信息更新",
            "description": "更新车辆信息",
            "targetObjectTypeId": 8,  # 车辆
            "inputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "licensePlate": {"type": "string"}, "vehicleType": {"type": "string"}, "ownerName": {"type": "string"}}},
            "outputSchema": {"type": "object", "properties": {"id": {"type": "string"}, "licensePlate": {"type": "string"}, "vehicleType": {"type": "string"}, "ownerName": {"type": "string"}, "updatedAt": {"type": "string"}}},
            "requiresApproval": False,
            "handlerFunction": "updateVehicleInfo",
            "createdAt": "2025-12-22",
            "updatedAt": "2025-12-22"
        }
    ]
}

def create_tables(conn):
    """创建数据库表"""
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
        isPrimaryKey BOOLEAN,
        isForeignKey BOOLEAN,
        defaultValue TEXT,
        constraints TEXT,
        sensitivityLevel VARCHAR(50),
        maskRule VARCHAR(50),
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
        sourceModelId INTEGER,
        targetModelId INTEGER,
        type VARCHAR(50),
        description TEXT,
        enabled BOOLEAN,
        FOREIGN KEY (sourceModelId) REFERENCES models(id),
        FOREIGN KEY (targetModelId) REFERENCES models(id)
    )
    """)
    
    # 创建共享属性表
    conn.execute("""
    CREATE TABLE IF NOT EXISTS shared_attributes (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        length TEXT,
        precision TEXT,
        description TEXT,
        valueRange TEXT,
        domainId INTEGER,
        referenceCount INTEGER,
        FOREIGN KEY (domainId) REFERENCES domains(id)
    )
    """)
    
    # 创建指标表
    conn.execute("""
    CREATE TABLE IF NOT EXISTS indicators (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        expression TEXT,
        returnType VARCHAR(50),
        unit VARCHAR(50),
        description TEXT,
        status VARCHAR(50),
        domainId INTEGER,
        createdAt DATE,
        updatedAt DATE,
        FOREIGN KEY (domainId) REFERENCES domains(id)
    )
    """)
    
    # 创建数据源表
    conn.execute("""
    CREATE TABLE IF NOT EXISTS datasources (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        url TEXT NOT NULL,
        username VARCHAR(100),
        password VARCHAR(100),
        tableName VARCHAR(100),
        status VARCHAR(50),
        description TEXT,
        modelId INTEGER,
        domainId INTEGER,
        createdAt DATE,
        updatedAt DATE,
        FOREIGN KEY (modelId) REFERENCES models(id),
        FOREIGN KEY (domainId) REFERENCES domains(id)
    )
    """)
    
    # 创建模型指标关联表
    conn.execute("""
    CREATE TABLE IF NOT EXISTS model_indicators (
        modelId INTEGER,
        indicatorId INTEGER,
        PRIMARY KEY (modelId, indicatorId),
        FOREIGN KEY (modelId) REFERENCES models(id),
        FOREIGN KEY (indicatorId) REFERENCES indicators(id)
    )
    """)
    
    # 创建函数表
    conn.execute("""
    CREATE TABLE IF NOT EXISTS functions (
        id INTEGER PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        code TEXT,
        inputSchema TEXT,
        returnType VARCHAR(50),
        version VARCHAR(20),
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
        name VARCHAR(100) NOT NULL,
        description TEXT,
        targetObjectTypeId INTEGER,
        inputSchema TEXT,
        outputSchema TEXT,
        requiresApproval BOOLEAN,
        handlerFunction VARCHAR(100),
        createdAt DATE,
        updatedAt DATE,
        FOREIGN KEY (targetObjectTypeId) REFERENCES models(id)
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
        status VARCHAR(50) DEFAULT 'active',
        createdAt DATE,
        updatedAt DATE,
        FOREIGN KEY (modelId) REFERENCES models(id),
        FOREIGN KEY (datasourceId) REFERENCES datasources(id)
    )
    """)
    
    print("数据库表创建完成")

def insert_data(conn, data):
    """插入演示数据"""
    # 插入业务域数据
    for domain in data["domains"]:
        conn.execute(
            "INSERT INTO domains (id, name, description, owner, updatedAt) VALUES (?, ?, ?, ?, ?)",
            (domain["id"], domain["name"], domain["description"], domain["owner"], domain["updatedAt"])
        )
    print("插入业务域数据完成")
    
    # 插入域边数据
    for edge in data["domain_edges"]:
        conn.execute(
            "INSERT INTO domain_edges (source, target) VALUES (?, ?)",
            (edge["source"], edge["target"])
        )
    print("插入域边数据完成")
    
    # 插入模型数据
    for model in data["models"]:
        conn.execute(
            "INSERT INTO models (id, name, code, description, creator, updatedAt, domainId) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (model["id"], model["name"], model["code"], model["description"], model["creator"], model["updatedAt"], model["domainId"])
        )
    print("插入模型数据完成")
    
    # 插入模型边数据
    for edge in data["model_edges"]:
        conn.execute(
            "INSERT INTO model_edges (source, target) VALUES (?, ?)",
            (edge["source"], edge["target"])
        )
    print("插入模型边数据完成")
    
    # 插入属性数据
    for prop in data["properties"]:
        conn.execute(
            "INSERT INTO properties (id, name, code, type, required, description, modelId, isPrimaryKey, isForeignKey, defaultValue, constraints, sensitivityLevel, maskRule, physicalColumn, foreignKeyTable, foreignKeyColumn) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                prop["id"], prop["name"], prop["code"], prop["type"], prop["required"], prop["description"],
                prop["modelId"], prop["isPrimaryKey"], prop["isForeignKey"], str(prop["defaultValue"]),
                json.dumps(prop["constraints"]), prop["sensitivityLevel"], prop["maskRule"],
                prop["physicalColumn"], prop.get("foreignKeyTable"), prop.get("foreignKeyColumn")
            )
        )
    print("插入属性数据完成")
    
    # 插入关系数据
    for relation in data["relations"]:
        conn.execute(
            "INSERT INTO relations (id, name, sourceModelId, targetModelId, type, description, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (
                relation["id"], relation["name"], relation["sourceModelId"], relation["targetModelId"],
                relation["type"], relation["description"], relation["enabled"]
            )
        )
    print("插入关系数据完成")
    
    # 插入共享属性数据
    for attr in data["shared_attributes"]:
        conn.execute(
            "INSERT INTO shared_attributes (id, name, type, length, precision, description, valueRange, domainId, referenceCount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                attr["id"], attr["name"], attr["type"], str(attr["length"]), str(attr["precision"]),
                attr["description"], attr["valueRange"], attr["domainId"], attr["referenceCount"]
            )
        )
    print("插入共享属性数据完成")
    
    # 插入指标数据
    for indicator in data["indicators"]:
        conn.execute(
            "INSERT INTO indicators (id, name, expression, returnType, unit, description, status, domainId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                indicator["id"], indicator["name"], indicator["expression"], indicator["returnType"],
                indicator["unit"], indicator["description"], indicator["status"], indicator["domainId"],
                indicator["createdAt"], indicator["updatedAt"]
            )
        )
    print("插入指标数据完成")
    
    # 插入数据源数据
    for datasource in data["datasources"]:
        # 添加domainId字段，默认为3（路网设施域）
        conn.execute(
            "INSERT INTO datasources (id, name, type, url, username, password, tableName, status, description, modelId, domainId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                datasource["id"], datasource["name"], datasource["type"], datasource["url"],
                datasource.get("username", "root"), # 默认值root
                datasource.get("password", "password"), # 默认值password
                datasource["tableName"], datasource["status"], datasource["description"], datasource["modelId"],
                3, # 默认为路网设施域
                datasource["createdAt"], datasource["updatedAt"]
            )
        )
    print("插入数据源数据完成")
    
    # 插入模型指标关联数据
    for mi in data["model_indicators"]:
        conn.execute(
            "INSERT INTO model_indicators (modelId, indicatorId) VALUES (?, ?)",
            (mi["modelId"], mi["indicatorId"])
        )
    print("插入模型指标关联数据完成")
    
    # 插入函数数据
    for func in data["functions"]:
        conn.execute(
            "INSERT INTO functions (id, name, description, code, inputSchema, returnType, version, metadata, domainId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                func["id"], func["name"], func["description"], func["code"],
                json.dumps(func["inputSchema"]), func["returnType"], func["version"],
                json.dumps(func["metadata"]), func["domainId"], func["createdAt"], func["updatedAt"]
            )
        )
    print("插入函数数据完成")
    
    # 插入动作类型数据
    for action_type in data["action_types"]:
        conn.execute(
            "INSERT INTO action_types (id, name, description, targetObjectTypeId, inputSchema, outputSchema, requiresApproval, handlerFunction, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (
                action_type["id"], action_type["name"], action_type["description"], action_type["targetObjectTypeId"],
                json.dumps(action_type["inputSchema"]), json.dumps(action_type["outputSchema"]),
                action_type["requiresApproval"], action_type["handlerFunction"],
                action_type["createdAt"], action_type["updatedAt"]
            )
        )
    print("插入动作类型数据完成")


def main():
    """主函数，执行数据迁移"""
    # 连接到DuckDB数据库
    conn = duckdb.connect(DB_PATH)
    
    try:
        # 创建表
        create_tables(conn)
        
        # 清空现有数据（处理主键冲突问题）
        tables_to_clear = ['action_types', 'functions', 'model_indicators', 'indicators', 'shared_attributes', 'relations', 'properties', 'model_edges', 'datasources', 'models', 'domain_edges', 'domains']
        for table in tables_to_clear:
            conn.execute(f"DELETE FROM {table} WHERE 1=1")
        print("\n已清空现有数据")
        
        # 插入数据
        insert_data(conn, mock_data)
        
        print("\n演示数据迁移完成！")
    except Exception as e:
        print(f"\n数据迁移失败: {e}")
        # 移除rollback调用，因为DuckDB默认不开启事务
    finally:
        # 关闭连接
        conn.close()


if __name__ == "__main__":
    main()

