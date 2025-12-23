from flask import Flask, jsonify, request
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# 获取当前日期
def get_current_date():
    return datetime.now().strftime("%Y-%m-%d")

# 获取下一个ID
def get_next_id(data_list):
    if not data_list:
        return 1
    return max(item["id"] for item in data_list) + 1

# 根据ID获取模型名称
def get_model_name_by_id(model_id):
    for model in mock_data["models"]:
        if model["id"] == model_id:
            return model["name"]
    return None

# 根据名称获取模型ID
def get_model_id_by_name(model_name):
    for model in mock_data["models"]:
        if model["name"] == model_name:
            return model["id"]
    return None

# 模拟数据库 - 路网设施域独立演示数据
mock_data = {
    "domains": [
        {"id": 3, "name": "路网设施域", "description": "管理高速公路路网设施", "owner": "路段管理部", "updatedAt": "2025-12-22"}
    ],
    "domain_edges": [],
    "models": [
        # 路网设施域核心模型
        {"id": 1, "name": "路段业主", "description": "高速公路路段业主", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 2, "name": "收费公路", "description": "收费公路信息", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 3, "name": "收费站", "description": "收费站信息", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 4, "name": "ETC门架", "description": "ETC门架信息", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 5, "name": "收费单元", "description": "收费单元信息", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 6, "name": "车道", "description": "收费站车道信息", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 7, "name": "标识点", "description": "路径标识点", "creator": "路段管理部", "updatedAt": "2025-12-22", "domainId": 3},
        
        # 关联模型（为了完整展示关系）
        {"id": 8, "name": "车辆", "description": "车辆基本信息", "creator": "车辆管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 9, "name": "通行介质", "description": "车辆通行介质", "creator": "车辆管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 10, "name": "交易流水", "description": "车辆交易流水记录", "creator": "收费管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 11, "name": "车辆通行路径", "description": "车辆实际通行路径", "creator": "路径管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 12, "name": "通行拟合路径", "description": "拟合后的通行路径", "creator": "路径管理部", "updatedAt": "2025-12-22", "domainId": 3},
        {"id": 13, "name": "拆分明细", "description": "交易拆分详情", "creator": "收费管理部", "updatedAt": "2025-12-22", "domainId": 3}
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
        {"id": 1, "name": "业主ID", "type": "string", "required": True, "description": "路段业主唯一标识", "modelId": 1, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "owner_id"},
        {"id": 2, "name": "业主名称", "type": "string", "required": True, "description": "路段业主名称", "modelId": 1, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "owner_name"},
        {"id": 3, "name": "联系方式", "type": "string", "required": True, "description": "业主联系方式", "modelId": 1, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "private", "maskRule": "phone_middle_4", "physicalColumn": "contact_info"},
        
        # 收费公路属性
        {"id": 4, "name": "公路ID", "type": "string", "required": True, "description": "收费公路唯一标识", "modelId": 2, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_id"},
        {"id": 5, "name": "公路名称", "type": "string", "required": True, "description": "收费公路名称", "modelId": 2, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_name"},
        {"id": 6, "name": "所属业主", "type": "string", "required": True, "description": "所属路段业主ID", "modelId": 2, "isPrimaryKey": False, "isForeignKey": True, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "owner_id", "foreignKeyTable": "owner", "foreignKeyColumn": "owner_id"},
        {"id": 7, "name": "公路等级", "type": "string", "required": True, "description": "公路等级", "modelId": 2, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(高速, 国道, 省道)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_level"},
        {"id": 8, "name": "起始里程", "type": "number", "required": True, "description": "起始里程", "modelId": 2, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "MIN(0)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "start_mileage"},
        {"id": 9, "name": "结束里程", "type": "number", "required": True, "description": "结束里程", "modelId": 2, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "MIN(0)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "end_mileage"},
        
        # 收费站属性
        {"id": 10, "name": "收费站ID", "type": "string", "required": True, "description": "收费站唯一标识", "modelId": 3, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "station_id"},
        {"id": 11, "name": "收费站名称", "type": "string", "required": True, "description": "收费站名称", "modelId": 3, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "station_name"},
        {"id": 12, "name": "所属公路", "type": "string", "required": True, "description": "所属收费公路ID", "modelId": 3, "isPrimaryKey": False, "isForeignKey": True, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_id", "foreignKeyTable": "road", "foreignKeyColumn": "road_id"},
        {"id": 13, "name": "收费站类型", "type": "string", "required": True, "description": "收费站类型", "modelId": 3, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(主线站, 匝道站)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "station_type"},
        
        # ETC门架属性
        {"id": 14, "name": "门架ID", "type": "string", "required": True, "description": "ETC门架唯一标识", "modelId": 4, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "gantry_id"},
        {"id": 15, "name": "门架名称", "type": "string", "required": True, "description": "ETC门架名称", "modelId": 4, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "gantry_name"},
        {"id": 16, "name": "所属公路", "type": "string", "required": True, "description": "所属收费公路ID", "modelId": 4, "isPrimaryKey": False, "isForeignKey": True, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_id", "foreignKeyTable": "road", "foreignKeyColumn": "road_id"},
        {"id": 17, "name": "门架位置", "type": "string", "required": True, "description": "门架位置", "modelId": 4, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "gantry_location"},
        {"id": 18, "name": "门架状态", "type": "string", "required": True, "description": "门架运行状态", "modelId": 4, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": "正常", "constraints": ["IN(正常, 故障, 维护)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "gantry_status"},
        
        # 收费单元属性
        {"id": 19, "name": "收费单元ID", "type": "string", "required": True, "description": "收费单元唯一标识", "modelId": 5, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "toll_unit_id"},
        {"id": 20, "name": "收费单元名称", "type": "string", "required": True, "description": "收费单元名称", "modelId": 5, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "toll_unit_name"},
        {"id": 21, "name": "所属公路", "type": "string", "required": True, "description": "所属收费公路ID", "modelId": 5, "isPrimaryKey": False, "isForeignKey": True, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "road_id", "foreignKeyTable": "road", "foreignKeyColumn": "road_id"},
        {"id": 22, "name": "收费类型", "type": "string", "required": True, "description": "收费类型", "modelId": 5, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(ETC, 人工, 混合)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "toll_type"},
        
        # 车道属性
        {"id": 23, "name": "车道ID", "type": "string", "required": True, "description": "车道唯一标识", "modelId": 6, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "lane_id"},
        {"id": 24, "name": "车道编号", "type": "string", "required": True, "description": "车道编号", "modelId": 6, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "lane_number"},
        {"id": 25, "name": "所属收费站", "type": "string", "required": True, "description": "所属收费站ID", "modelId": 6, "isPrimaryKey": False, "isForeignKey": True, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "station_id", "foreignKeyTable": "toll_station", "foreignKeyColumn": "station_id"},
        {"id": 26, "name": "车道类型", "type": "string", "required": True, "description": "车道类型（ETC、人工等）", "modelId": 6, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(ETC, 人工, 混合)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "lane_type"},
        {"id": 27, "name": "车道状态", "type": "string", "required": True, "description": "车道运行状态", "modelId": 6, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": "正常", "constraints": ["IN(正常, 故障, 关闭)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "lane_status"},
        
        # 标识点属性
        {"id": 28, "name": "标识点ID", "type": "string", "required": True, "description": "标识点唯一标识", "modelId": 7, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "marker_id"},
        {"id": 29, "name": "标识点名称", "type": "string", "required": True, "description": "标识点名称", "modelId": 7, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "marker_name"},
        {"id": 30, "name": "经度", "type": "number", "required": True, "description": "标识点经度", "modelId": 7, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "BETWEEN(-180, 180)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "longitude"},
        {"id": 31, "name": "纬度", "type": "number", "required": True, "description": "标识点纬度", "modelId": 7, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "BETWEEN(-90, 90)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "latitude"},
        {"id": 32, "name": "标识点类型", "type": "string", "required": True, "description": "标识点类型", "modelId": 7, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(入口, 出口, 中间点)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "marker_type"},
        
        # 车辆属性
        {"id": 33, "name": "车辆ID", "type": "string", "required": True, "description": "车辆唯一标识", "modelId": 8, "isPrimaryKey": True, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "vehicle_id"},
        {"id": 34, "name": "车牌号", "type": "string", "required": True, "description": "车辆牌照号码", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "UNIQUE"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "license_plate"},
        {"id": 35, "name": "车型", "type": "string", "required": True, "description": "车辆类型", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(小型客车, 大型客车, 小型货车, 大型货车, 中型客车)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "vehicle_type"},
        {"id": 36, "name": "车主姓名", "type": "string", "required": True, "description": "车辆所有人姓名", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL"], "sensitivityLevel": "private", "maskRule": "name_last_char", "physicalColumn": "owner_name"},
        {"id": 37, "name": "车主身份证号", "type": "string", "required": False, "description": "车主身份证号码", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["LENGTH(18)"], "sensitivityLevel": "private", "maskRule": "id_card_middle_8", "physicalColumn": "owner_id_card"},
        {"id": 38, "name": "车辆颜色", "type": "string", "required": False, "description": "车辆颜色", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": [], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "vehicle_color"},
        {"id": 39, "name": "注册日期", "type": "date", "required": False, "description": "车辆注册日期", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": [], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "register_date"},
        {"id": 40, "name": "车辆状态", "type": "string", "required": True, "description": "车辆状态", "modelId": 8, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": "正常", "constraints": ["IN(正常, 注销, 报废, 查封)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "vehicle_status"}
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
    ]
}

# 业务域相关接口
@app.route('/api/domain/list', methods=['GET'])
def get_domain_list():
    """获取域列表和边"""
    return jsonify({
        "domains": mock_data["domains"],
        "edges": mock_data["domain_edges"]
    })

@app.route('/api/domain', methods=['POST'])
def create_domain():
    """新建域"""
    data = request.get_json()
    domain = {
        "id": len(mock_data["domains"]) + 1,
        "name": data["name"],
        "description": data["description"],
        "owner": data["owner"],
        "updatedAt": "2025-12-19"
    }
    mock_data["domains"].append(domain)
    return jsonify(domain), 201

@app.route('/api/domain/<int:id>', methods=['PUT'])
def update_domain(id):
    """更新域"""
    data = request.get_json()
    for domain in mock_data["domains"]:
        if domain["id"] == id:
            domain.update(data)
            domain["updatedAt"] = "2025-12-19"
            return jsonify(domain)
    return jsonify({"error": "Domain not found"}), 404

@app.route('/api/domain/<int:id>', methods=['DELETE'])
def delete_domain(id):
    """删除域"""
    mock_data["domains"] = [d for d in mock_data["domains"] if d["id"] != id]
    mock_data["domain_edges"] = [e for e in mock_data["domain_edges"] if e["source"] != id and e["target"] != id]
    return jsonify({"message": "Domain deleted"})

# 模型相关接口
@app.route('/api/model', methods=['GET'])
def get_models():
    """获取模型列表"""
    domain_id = request.args.get('domainId')
    if domain_id:
        models = [m for m in mock_data["models"] if m["domainId"] == int(domain_id)]
        edges = [e for e in mock_data["model_edges"] if e["source"] in [m["id"] for m in models] and e["target"] in [m["id"] for m in models]]
        return jsonify({
            "models": models,
            "edges": edges
        })
    return jsonify({
        "models": mock_data["models"],
        "edges": mock_data["model_edges"]
    })

@app.route('/api/model', methods=['POST'])
def create_model():
    """新建模型"""
    data = request.get_json()
    model = {
        "id": len(mock_data["models"]) + 1,
        "name": data["name"],
        "description": data["description"],
        "creator": "当前用户",
        "updatedAt": "2025-12-19",
        "domainId": int(data["domainId"])
    }
    mock_data["models"].append(model)
    return jsonify(model), 201

@app.route('/api/model/<int:id>', methods=['PUT'])
def update_model(id):
    """更新模型"""
    data = request.get_json()
    for model in mock_data["models"]:
        if model["id"] == id:
            model.update(data)
            model["updatedAt"] = "2025-12-19"
            return jsonify(model)
    return jsonify({"error": "Model not found"}), 404

@app.route('/api/model/<int:id>', methods=['DELETE'])
def delete_model(id):
    """删除模型"""
    mock_data["models"] = [m for m in mock_data["models"] if m["id"] != id]
    mock_data["model_edges"] = [e for e in mock_data["model_edges"] if e["source"] != id and e["target"] != id]
    mock_data["properties"] = [p for p in mock_data["properties"] if p["modelId"] != id]
    return jsonify({"message": "Model deleted"})

# 属性相关接口
@app.route('/api/property', methods=['GET'])
def get_properties():
    """获取属性列表"""
    model_id = request.args.get('modelId')
    if model_id:
        return jsonify([p for p in mock_data["properties"] if p["modelId"] == int(model_id)])
    return jsonify(mock_data["properties"])

@app.route('/api/property', methods=['POST'])
def create_property():
    """新建属性"""
    data = request.get_json()
    property = {
        "id": len(mock_data["properties"]) + 1,
        "name": data["name"],
        "type": data["type"],
        "required": data["required"],
        "description": data["description"],
        "modelId": int(data["modelId"]),
        "isPrimaryKey": data.get("isPrimaryKey", False),
        "isForeignKey": data.get("isForeignKey", False),
        "defaultValue": data.get("defaultValue", None),
        "constraints": data.get("constraints", []),
        "sensitivityLevel": data.get("sensitivityLevel", "public"),
        "maskRule": data.get("maskRule", None),
        "physicalColumn": data.get("physicalColumn", data["name"].lower().replace(" ", "_"))
    }
    mock_data["properties"].append(property)
    return jsonify(property), 201

@app.route('/api/property/<int:id>', methods=['DELETE'])
def delete_property(id):
    """删除属性"""
    mock_data["properties"] = [p for p in mock_data["properties"] if p["id"] != id]
    return jsonify({"message": "Property deleted"})

# 关系相关接口
@app.route('/api/relation', methods=['GET'])
def get_relations():
    """获取关系列表"""
    model_id = request.args.get('modelId')
    domain_id = request.args.get('domainId')
    
    relations = mock_data["relations"]
    
    # 为关系添加模型名称信息
    result = []
    for r in relations:
        relation_with_names = {
            **r,
            "sourceModel": get_model_name_by_id(r["sourceModelId"]),
            "targetModel": get_model_name_by_id(r["targetModelId"])
        }
        result.append(relation_with_names)
    
    if model_id:
        result = [r for r in result if r["sourceModelId"] == int(model_id)]
    
    if domain_id:
        # 获取该域下的所有模型ID
        domain_model_ids = [m["id"] for m in mock_data["models"] if m["domainId"] == int(domain_id)]
        result = [r for r in result if r["sourceModelId"] in domain_model_ids]
    
    return jsonify(result)

@app.route('/api/relation', methods=['POST'])
def create_relation():
    """新建关系"""
    data = request.get_json()
    
    # 支持通过模型名称或ID创建关系
    source_model_id = data.get("sourceModelId")
    target_model_id = data.get("targetModelId")
    
    if not source_model_id and data.get("sourceModel"):
        source_model_id = get_model_id_by_name(data["sourceModel"])
    if not target_model_id and data.get("targetModel"):
        target_model_id = get_model_id_by_name(data["targetModel"])
    
    if not source_model_id or not target_model_id:
        return jsonify({"error": "Invalid source or target model"}), 400
    
    relation = {
        "id": get_next_id(mock_data["relations"]),
        "name": data["name"],
        "sourceModelId": source_model_id,
        "targetModelId": target_model_id,
        "type": data.get("type", "one-to-many"),
        "description": data.get("description", ""),
        "enabled": data.get("enabled", True)
    }
    mock_data["relations"].append(relation)
    
    # 同步更新model_edges
    mock_data["model_edges"].append({
        "source": source_model_id,
        "target": target_model_id
    })
    
    # 返回时添加模型名称
    relation["sourceModel"] = get_model_name_by_id(source_model_id)
    relation["targetModel"] = get_model_name_by_id(target_model_id)
    
    return jsonify(relation), 201

@app.route('/api/relation/<int:id>', methods=['PUT'])
def update_relation(id):
    """更新关系"""
    data = request.get_json()
    for relation in mock_data["relations"]:
        if relation["id"] == id:
            # 更新目标模型ID
            if data.get("targetModelId"):
                relation["targetModelId"] = data["targetModelId"]
            elif data.get("targetModel"):
                target_id = get_model_id_by_name(data["targetModel"])
                if target_id:
                    relation["targetModelId"] = target_id
            
            relation["name"] = data.get("name", relation["name"])
            relation["type"] = data.get("type", relation["type"])
            relation["description"] = data.get("description", relation["description"])
            relation["enabled"] = data.get("enabled", relation["enabled"])
            
            # 返回时添加模型名称
            result = {
                **relation,
                "sourceModel": get_model_name_by_id(relation["sourceModelId"]),
                "targetModel": get_model_name_by_id(relation["targetModelId"])
            }
            return jsonify(result)
    return jsonify({"error": "Relation not found"}), 404

@app.route('/api/relation/<int:id>', methods=['DELETE'])
def delete_relation(id):
    """删除关系"""
    # 找到要删除的关系
    relation_to_delete = None
    for r in mock_data["relations"]:
        if r["id"] == id:
            relation_to_delete = r
            break
    
    if relation_to_delete:
        # 同步删除model_edges中的对应边
        mock_data["model_edges"] = [
            e for e in mock_data["model_edges"] 
            if not (e["source"] == relation_to_delete["sourceModelId"] and 
                   e["target"] == relation_to_delete["targetModelId"])
        ]
    
    mock_data["relations"] = [r for r in mock_data["relations"] if r["id"] != id]
    return jsonify({"message": "Relation deleted", "success": True})

@app.route('/api/relation/<int:id>/toggle', methods=['PUT'])
def toggle_relation(id):
    """启用/禁用关系"""
    for relation in mock_data["relations"]:
        if relation["id"] == id:
            relation["enabled"] = not relation["enabled"]
            result = {
                **relation,
                "sourceModel": get_model_name_by_id(relation["sourceModelId"]),
                "targetModel": get_model_name_by_id(relation["targetModelId"])
            }
            return jsonify(result)
    return jsonify({"error": "Relation not found"}), 404

# 共享属性相关接口
@app.route('/api/shared-attribute', methods=['GET'])
def get_shared_attributes():
    """获取共享属性列表"""
    domain_id = request.args.get('domainId')
    if domain_id:
        return jsonify([a for a in mock_data["shared_attributes"] if a["domainId"] == int(domain_id)])
    return jsonify(mock_data["shared_attributes"])

@app.route('/api/shared-attribute', methods=['POST'])
def create_shared_attribute():
    """新建共享属性"""
    data = request.get_json()
    attr = {
        "id": get_next_id(mock_data["shared_attributes"]),
        "name": data["name"],
        "type": data.get("type", "string"),
        "length": data.get("length"),
        "precision": data.get("precision"),
        "description": data.get("description", ""),
        "valueRange": data.get("valueRange"),
        "domainId": int(data.get("domainId", 3)),
        "referenceCount": 0
    }
    mock_data["shared_attributes"].append(attr)
    return jsonify(attr), 201

@app.route('/api/shared-attribute/<int:id>', methods=['PUT'])
def update_shared_attribute(id):
    """更新共享属性"""
    data = request.get_json()
    for attr in mock_data["shared_attributes"]:
        if attr["id"] == id:
            attr.update({
                "name": data.get("name", attr["name"]),
                "type": data.get("type", attr["type"]),
                "length": data.get("length", attr["length"]),
                "precision": data.get("precision", attr["precision"]),
                "description": data.get("description", attr["description"]),
                "valueRange": data.get("valueRange", attr["valueRange"])
            })
            return jsonify(attr)
    return jsonify({"error": "Shared attribute not found"}), 404

@app.route('/api/shared-attribute/<int:id>', methods=['DELETE'])
def delete_shared_attribute(id):
    """删除共享属性"""
    mock_data["shared_attributes"] = [a for a in mock_data["shared_attributes"] if a["id"] != id]
    return jsonify({"message": "Shared attribute deleted", "success": True})

# 语义指标相关接口
@app.route('/api/indicator', methods=['GET'])
def get_indicators():
    """获取指标列表"""
    domain_id = request.args.get('domainId')
    model_id = request.args.get('modelId')
    status = request.args.get('status')
    
    result = mock_data["indicators"]
    
    if domain_id:
        result = [i for i in result if i["domainId"] == int(domain_id)]
    
    if status:
        result = [i for i in result if i["status"] == status]
    
    if model_id:
        # 获取该模型绑定的指标ID
        bound_indicator_ids = [
            mi["indicatorId"] for mi in mock_data["model_indicators"] 
            if mi["modelId"] == int(model_id)
        ]
        result = [i for i in result if i["id"] in bound_indicator_ids]
    
    return jsonify(result)

@app.route('/api/indicator', methods=['POST'])
def create_indicator():
    """新建指标"""
    data = request.get_json()
    indicator = {
        "id": get_next_id(mock_data["indicators"]),
        "name": data["name"],
        "expression": data.get("expression", ""),
        "returnType": data.get("returnType", "number"),
        "unit": data.get("unit", ""),
        "description": data.get("description", ""),
        "status": data.get("status", "draft"),
        "domainId": int(data.get("domainId", 3)),
        "createdAt": get_current_date(),
        "updatedAt": get_current_date()
    }
    mock_data["indicators"].append(indicator)
    return jsonify(indicator), 201

@app.route('/api/indicator/<int:id>', methods=['PUT'])
def update_indicator(id):
    """更新指标"""
    data = request.get_json()
    for indicator in mock_data["indicators"]:
        if indicator["id"] == id:
            indicator.update({
                "name": data.get("name", indicator["name"]),
                "expression": data.get("expression", indicator["expression"]),
                "returnType": data.get("returnType", indicator["returnType"]),
                "unit": data.get("unit", indicator["unit"]),
                "description": data.get("description", indicator["description"]),
                "status": data.get("status", indicator["status"]),
                "updatedAt": get_current_date()
            })
            return jsonify(indicator)
    return jsonify({"error": "Indicator not found"}), 404

@app.route('/api/indicator/<int:id>', methods=['DELETE'])
def delete_indicator(id):
    """删除指标"""
    mock_data["indicators"] = [i for i in mock_data["indicators"] if i["id"] != id]
    # 同时删除模型绑定关系
    mock_data["model_indicators"] = [mi for mi in mock_data["model_indicators"] if mi["indicatorId"] != id]
    return jsonify({"message": "Indicator deleted", "success": True})

@app.route('/api/indicator/<int:id>/publish', methods=['PUT'])
def publish_indicator(id):
    """发布指标"""
    for indicator in mock_data["indicators"]:
        if indicator["id"] == id:
            indicator["status"] = "published"
            indicator["updatedAt"] = get_current_date()
            return jsonify(indicator)
    return jsonify({"error": "Indicator not found"}), 404

@app.route('/api/indicator/<int:id>/offline', methods=['PUT'])
def offline_indicator(id):
    """下线指标"""
    for indicator in mock_data["indicators"]:
        if indicator["id"] == id:
            indicator["status"] = "offline"
            indicator["updatedAt"] = get_current_date()
            return jsonify(indicator)
    return jsonify({"error": "Indicator not found"}), 404

# 模型-指标绑定接口
@app.route('/api/model/<int:model_id>/indicator', methods=['GET'])
def get_model_indicators(model_id):
    """获取模型绑定的指标"""
    bound_indicator_ids = [
        mi["indicatorId"] for mi in mock_data["model_indicators"] 
        if mi["modelId"] == model_id
    ]
    result = [i for i in mock_data["indicators"] if i["id"] in bound_indicator_ids]
    return jsonify(result)

@app.route('/api/model/<int:model_id>/indicator/<int:indicator_id>', methods=['POST'])
def bind_indicator(model_id, indicator_id):
    """绑定指标到模型"""
    # 检查是否已绑定
    for mi in mock_data["model_indicators"]:
        if mi["modelId"] == model_id and mi["indicatorId"] == indicator_id:
            return jsonify({"error": "Already bound"}), 400
    
    mock_data["model_indicators"].append({
        "modelId": model_id,
        "indicatorId": indicator_id
    })
    return jsonify({"message": "Indicator bound", "success": True}), 201

@app.route('/api/model/<int:model_id>/indicator/<int:indicator_id>', methods=['DELETE'])
def unbind_indicator(model_id, indicator_id):
    """解绑指标"""
    mock_data["model_indicators"] = [
        mi for mi in mock_data["model_indicators"] 
        if not (mi["modelId"] == model_id and mi["indicatorId"] == indicator_id)
    ]
    return jsonify({"message": "Indicator unbound", "success": True})

# 数据源相关接口
@app.route('/api/datasource', methods=['GET'])
def get_datasources():
    """获取数据源列表"""
    model_id = request.args.get('modelId')
    print(f"GET /api/datasource - modelId: {model_id}")  # 调试信息
    
    if model_id and model_id.strip():
        try:
            model_id_int = int(model_id)
            filtered = [d for d in mock_data["datasources"] if d.get("modelId") == model_id_int]
            print(f"Filtered datasources for model {model_id_int}: {len(filtered)} found")  # 调试信息
            return jsonify(filtered)
        except (ValueError, TypeError) as e:
            print(f"Error parsing modelId: {e}")  # 调试信息
            # 如果modelId不是有效整数，返回所有数据源
            return jsonify(mock_data["datasources"])
    
    print(f"Returning all datasources: {len(mock_data['datasources'])} total")  # 调试信息
    return jsonify(mock_data["datasources"])

@app.route('/api/datasource', methods=['POST'])
def create_datasource():
    """新建数据源"""
    data = request.get_json()
    datasource = {
        "id": get_next_id(mock_data["datasources"]),
        "name": data["name"],
        "type": data.get("type", "mysql"),
        "url": data.get("url", ""),
        "tableName": data.get("tableName", ""),
        "status": data.get("status", "inactive"),
        "description": data.get("description", ""),
        "modelId": int(data.get("modelId", 0)),
        "createdAt": get_current_date(),
        "updatedAt": get_current_date()
    }
    mock_data["datasources"].append(datasource)
    return jsonify(datasource), 201

@app.route('/api/datasource/<int:id>', methods=['PUT'])
def update_datasource(id):
    """更新数据源"""
    data = request.get_json()
    for datasource in mock_data["datasources"]:
        if datasource["id"] == id:
            datasource.update({
                "name": data.get("name", datasource["name"]),
                "type": data.get("type", datasource["type"]),
                "url": data.get("url", datasource["url"]),
                "tableName": data.get("tableName", datasource["tableName"]),
                "status": data.get("status", datasource["status"]),
                "description": data.get("description", datasource["description"]),
                "updatedAt": get_current_date()
            })
            return jsonify(datasource)
    return jsonify({"error": "Datasource not found"}), 404

@app.route('/api/datasource/<int:id>', methods=['DELETE'])
def delete_datasource(id):
    """删除数据源"""
    mock_data["datasources"] = [d for d in mock_data["datasources"] if d["id"] != id]
    return jsonify({"message": "Datasource deleted", "success": True})

@app.route('/api/datasource/<int:id>/toggle', methods=['PUT'])
def toggle_datasource(id):
    """启用/禁用数据源"""
    for datasource in mock_data["datasources"]:
        if datasource["id"] == id:
            datasource["status"] = "inactive" if datasource["status"] == "active" else "active"
            datasource["updatedAt"] = get_current_date()
            return jsonify(datasource)
    return jsonify({"error": "Datasource not found"}), 404

# 属性更新接口
@app.route('/api/property/<int:id>', methods=['PUT'])
def update_property(id):
    """更新属性"""
    data = request.get_json()
    for prop in mock_data["properties"]:
        if prop["id"] == id:
            prop.update({
                "name": data.get("name", prop["name"]),
                "type": data.get("type", prop["type"]),
                "required": data.get("required", prop["required"]),
                "description": data.get("description", prop["description"]),
                "isPrimaryKey": data.get("isPrimaryKey", prop["isPrimaryKey"]),
                "isForeignKey": data.get("isForeignKey", prop["isForeignKey"]),
                "defaultValue": data.get("defaultValue", prop["defaultValue"]),
                "constraints": data.get("constraints", prop["constraints"]),
                "sensitivityLevel": data.get("sensitivityLevel", prop["sensitivityLevel"]),
                "maskRule": data.get("maskRule", prop["maskRule"]),
                "physicalColumn": data.get("physicalColumn", prop["physicalColumn"])
            })
            return jsonify(prop)
    return jsonify({"error": "Property not found"}), 404

# 数据记录相关接口
@app.route('/api/data', methods=['GET'])
def get_data_records():
    """获取模型数据记录"""
    model_id = request.args.get('modelId')
    if not model_id or not model_id.strip():
        return jsonify([])
    
    try:
        model_id = int(model_id)
    except (ValueError, TypeError):
        return jsonify([])
    
    # 根据模型ID返回对应的模拟数据
    mock_data_by_model = {
        1: [  # 路段业主
            {"id": 1, "owner_id": "OWNER001", "owner_name": "京沪高速公路有限公司", "contact_info": "010-12345678"},
            {"id": 2, "owner_id": "OWNER002", "owner_name": "沪宁高速公路管理公司", "contact_info": "021-87654321"},
            {"id": 3, "owner_id": "OWNER003", "owner_name": "广深高速公路股份公司", "contact_info": "020-11223344"},
            {"id": 4, "owner_id": "OWNER004", "owner_name": "京港澳高速公路有限公司", "contact_info": "010-23456789"},
            {"id": 5, "owner_id": "OWNER005", "owner_name": "沪昆高速公路管理公司", "contact_info": "021-34567890"}
        ],
        2: [  # 收费公路
            {"id": 1, "road_id": "ROAD001", "road_name": "京沪高速", "owner_id": "OWNER001", "road_level": "高速", "start_mileage": 0, "end_mileage": 1200},
            {"id": 2, "road_id": "ROAD002", "road_name": "沪宁高速", "owner_id": "OWNER002", "road_level": "高速", "start_mileage": 0, "end_mileage": 274},
            {"id": 3, "road_id": "ROAD003", "road_name": "广深高速", "owner_id": "OWNER003", "road_level": "高速", "start_mileage": 0, "end_mileage": 122.8},
            {"id": 4, "road_id": "ROAD004", "road_name": "京港澳高速", "owner_id": "OWNER004", "road_level": "高速", "start_mileage": 0, "end_mileage": 2285},
            {"id": 5, "road_id": "ROAD005", "road_name": "沪昆高速", "owner_id": "OWNER005", "road_level": "高速", "start_mileage": 0, "end_mileage": 2730}
        ],
        3: [  # 收费站
            {"id": 1, "station_id": "STATION001", "station_name": "北京收费站", "road_id": "ROAD001", "station_type": "主线站"},
            {"id": 2, "station_id": "STATION002", "station_name": "上海收费站", "road_id": "ROAD001", "station_type": "主线站"},
            {"id": 3, "station_id": "STATION003", "station_name": "南京收费站", "road_id": "ROAD002", "station_type": "主线站"},
            {"id": 4, "station_id": "STATION004", "station_name": "天津收费站", "road_id": "ROAD001", "station_type": "匝道站"},
            {"id": 5, "station_id": "STATION005", "station_name": "苏州收费站", "road_id": "ROAD002", "station_type": "主线站"},
            {"id": 6, "station_id": "STATION006", "station_name": "无锡收费站", "road_id": "ROAD002", "station_type": "匝道站"},
            {"id": 7, "station_id": "STATION007", "station_name": "广州收费站", "road_id": "ROAD003", "station_type": "主线站"},
            {"id": 8, "station_id": "STATION008", "station_name": "深圳收费站", "road_id": "ROAD003", "station_type": "主线站"}
        ],
        4: [  # ETC门架
            {"id": 1, "gantry_id": "GANTRY001", "gantry_name": "京沪高速K100门架", "road_id": "ROAD001", "gantry_location": "K100+500", "gantry_status": "正常"},
            {"id": 2, "gantry_id": "GANTRY002", "gantry_name": "京沪高速K200门架", "road_id": "ROAD001", "gantry_location": "K200+300", "gantry_status": "正常"},
            {"id": 3, "gantry_id": "GANTRY003", "gantry_name": "沪宁高速K50门架", "road_id": "ROAD002", "gantry_location": "K50+200", "gantry_status": "正常"},
            {"id": 4, "gantry_id": "GANTRY004", "gantry_name": "广深高速K30门架", "road_id": "ROAD003", "gantry_location": "K30+100", "gantry_status": "正常"},
            {"id": 5, "gantry_id": "GANTRY005", "gantry_name": "京港澳高速K150门架", "road_id": "ROAD004", "gantry_location": "K150+400", "gantry_status": "正常"}
        ],
        5: [  # 收费单元
            {"id": 1, "toll_unit_id": "UNIT001", "toll_unit_name": "京沪高速收费单元1", "road_id": "ROAD001", "toll_type": "ETC"},
            {"id": 2, "toll_unit_id": "UNIT002", "toll_unit_name": "京沪高速收费单元2", "road_id": "ROAD001", "toll_type": "混合"},
            {"id": 3, "toll_unit_id": "UNIT003", "toll_unit_name": "沪宁高速收费单元1", "road_id": "ROAD002", "toll_type": "ETC"},
            {"id": 4, "toll_unit_id": "UNIT004", "toll_unit_name": "广深高速收费单元1", "road_id": "ROAD003", "toll_type": "人工"},
            {"id": 5, "toll_unit_id": "UNIT005", "toll_unit_name": "京港澳高速收费单元1", "road_id": "ROAD004", "toll_type": "ETC"}
        ],
        6: [  # 车道
            {"id": 1, "lane_id": "LANE001", "lane_number": "1", "station_id": "STATION001", "lane_type": "ETC", "lane_status": "正常"},
            {"id": 2, "lane_id": "LANE002", "lane_number": "2", "station_id": "STATION001", "lane_type": "人工", "lane_status": "正常"},
            {"id": 3, "lane_id": "LANE003", "lane_number": "3", "station_id": "STATION001", "lane_type": "混合", "lane_status": "正常"},
            {"id": 4, "lane_id": "LANE004", "lane_number": "1", "station_id": "STATION002", "lane_type": "ETC", "lane_status": "正常"},
            {"id": 5, "lane_id": "LANE005", "lane_number": "2", "station_id": "STATION002", "lane_type": "人工", "lane_status": "正常"},
            {"id": 6, "lane_id": "LANE006", "lane_number": "1", "station_id": "STATION003", "lane_type": "ETC", "lane_status": "正常"}
        ],
        7: [  # 标识点
            {"id": 1, "marker_id": "MARKER001", "marker_name": "北京入口标识点", "longitude": 116.4074, "latitude": 39.9042, "marker_type": "入口"},
            {"id": 2, "marker_id": "MARKER002", "marker_name": "京沪高速K100标识点", "longitude": 116.5000, "latitude": 39.9000, "marker_type": "中间点"},
            {"id": 3, "marker_id": "MARKER003", "marker_name": "上海出口标识点", "longitude": 121.4737, "latitude": 31.2304, "marker_type": "出口"},
            {"id": 4, "marker_id": "MARKER004", "marker_name": "南京入口标识点", "longitude": 118.7969, "latitude": 32.0603, "marker_type": "入口"},
            {"id": 5, "marker_id": "MARKER005", "marker_name": "沪宁高速K50标识点", "longitude": 119.0000, "latitude": 31.5000, "marker_type": "中间点"},
            {"id": 6, "marker_id": "MARKER006", "marker_name": "广州入口标识点", "longitude": 113.2644, "latitude": 23.1291, "marker_type": "入口"},
            {"id": 7, "marker_id": "MARKER007", "marker_name": "深圳出口标识点", "longitude": 114.0579, "latitude": 22.5431, "marker_type": "出口"}
        ],
        8: [  # 车辆
            {"id": 1, "vehicle_id": "VEH001", "license_plate": "京A12345", "vehicle_type": "小型客车", "owner_name": "张三", "owner_id_card": "110101199001011234", "vehicle_color": "黑色", "register_date": "2020-01-01", "vehicle_status": "正常"},
            {"id": 2, "vehicle_id": "VEH002", "license_plate": "沪B67890", "vehicle_type": "大型货车", "owner_name": "李四", "owner_id_card": "310101198505056789", "vehicle_color": "蓝色", "register_date": "2018-05-15", "vehicle_status": "正常"},
            {"id": 3, "vehicle_id": "VEH003", "license_plate": "粤C54321", "vehicle_type": "小型客车", "owner_name": "王五", "owner_id_card": "440401199510102345", "vehicle_color": "白色", "register_date": "2021-03-20", "vehicle_status": "正常"},
            {"id": 4, "vehicle_id": "VEH004", "license_plate": "苏D98765", "vehicle_type": "中型客车", "owner_name": "赵六", "owner_id_card": "320401198808087890", "vehicle_color": "银色", "register_date": "2019-07-10", "vehicle_status": "正常"},
            {"id": 5, "vehicle_id": "VEH005", "license_plate": "粤B36985", "vehicle_type": "大型客车", "owner_name": "孙七", "owner_id_card": "440301199212123456", "vehicle_color": "黄色", "register_date": "2017-11-05", "vehicle_status": "正常"}
        ],
        9: [  # 通行介质
            {"id": 1, "medium_id": "MEDIUM001", "medium_type": "ETC卡", "vehicle_id": "VEH001", "card_number": "6217000010001234567", "balance": 500.0},
            {"id": 2, "medium_id": "MEDIUM002", "medium_type": "ETC卡", "vehicle_id": "VEH002", "card_number": "6217000010002345678", "balance": 1000.0},
            {"id": 3, "medium_id": "MEDIUM003", "medium_type": "ETC卡", "vehicle_id": "VEH003", "card_number": "6217000010003456789", "balance": 300.0},
            {"id": 4, "medium_id": "MEDIUM004", "medium_type": "ETC卡", "vehicle_id": "VEH004", "card_number": "6217000010004567890", "balance": 800.0},
            {"id": 5, "medium_id": "MEDIUM005", "medium_type": "ETC卡", "vehicle_id": "VEH005", "card_number": "6217000010005678901", "balance": 1200.0}
        ],
        10: [  # 交易流水
            {"id": 1, "transaction_id": "TXN001", "vehicle_id": "VEH001", "marker_id": "MARKER001", "transaction_time": "2025-12-19 08:00:00", "amount": 50.0, "status": "成功"},
            {"id": 2, "transaction_id": "TXN002", "vehicle_id": "VEH002", "marker_id": "MARKER002", "transaction_time": "2025-12-19 08:15:00", "amount": 120.0, "status": "成功"},
            {"id": 3, "transaction_id": "TXN003", "vehicle_id": "VEH003", "marker_id": "MARKER003", "transaction_time": "2025-12-19 08:30:00", "amount": 80.0, "status": "成功"},
            {"id": 4, "transaction_id": "TXN004", "vehicle_id": "VEH001", "marker_id": "MARKER002", "transaction_time": "2025-12-19 09:00:00", "amount": 60.0, "status": "成功"},
            {"id": 5, "transaction_id": "TXN005", "vehicle_id": "VEH004", "marker_id": "MARKER004", "transaction_time": "2025-12-19 09:15:00", "amount": 45.0, "status": "成功"},
            {"id": 6, "transaction_id": "TXN006", "vehicle_id": "VEH005", "marker_id": "MARKER006", "transaction_time": "2025-12-19 10:00:00", "amount": 150.0, "status": "成功"},
            {"id": 7, "transaction_id": "TXN007", "vehicle_id": "VEH003", "marker_id": "MARKER007", "transaction_time": "2025-12-19 10:30:00", "amount": 90.0, "status": "成功"}
        ],
        11: [  # 车辆通行路径
            {"id": 1, "path_id": "PATH001", "vehicle_id": "VEH001", "start_marker": "MARKER001", "end_marker": "MARKER003", "path_length": 1200.5, "create_time": "2025-12-19 08:30:00"},
            {"id": 2, "path_id": "PATH002", "vehicle_id": "VEH002", "start_marker": "MARKER002", "end_marker": "MARKER003", "path_length": 800.3, "create_time": "2025-12-19 09:00:00"},
            {"id": 3, "path_id": "PATH003", "vehicle_id": "VEH003", "start_marker": "MARKER003", "end_marker": "MARKER004", "path_length": 274.2, "create_time": "2025-12-19 09:15:00"},
            {"id": 4, "path_id": "PATH004", "vehicle_id": "VEH004", "start_marker": "MARKER004", "end_marker": "MARKER005", "path_length": 50.0, "create_time": "2025-12-19 09:30:00"},
            {"id": 5, "path_id": "PATH005", "vehicle_id": "VEH005", "start_marker": "MARKER006", "end_marker": "MARKER007", "path_length": 122.8, "create_time": "2025-12-19 10:30:00"}
        ],
        12: [  # 通行拟合路径
            {"id": 1, "fitted_path_id": "FITTED001", "path_id": "PATH001", "fitted_length": 1200.0, "fitted_time": "2025-12-19 08:30:00", "accuracy": 0.95},
            {"id": 2, "fitted_path_id": "FITTED002", "path_id": "PATH002", "fitted_length": 800.0, "fitted_time": "2025-12-19 09:00:00", "accuracy": 0.92},
            {"id": 3, "fitted_path_id": "FITTED003", "path_id": "PATH003", "fitted_length": 274.0, "fitted_time": "2025-12-19 09:15:00", "accuracy": 0.98},
            {"id": 4, "fitted_path_id": "FITTED004", "path_id": "PATH004", "fitted_length": 50.0, "fitted_time": "2025-12-19 09:30:00", "accuracy": 0.99},
            {"id": 5, "fitted_path_id": "FITTED005", "path_id": "PATH005", "fitted_length": 122.8, "fitted_time": "2025-12-19 10:30:00", "accuracy": 0.97}
        ],
        13: [  # 拆分明细
            {"id": 1, "split_id": "SPLIT001", "fitted_path_id": "FITTED001", "toll_unit_id": "UNIT001", "split_amount": 30.0, "split_ratio": 0.6, "split_time": "2025-12-19 08:35:00"},
            {"id": 2, "split_id": "SPLIT002", "fitted_path_id": "FITTED001", "toll_unit_id": "UNIT002", "split_amount": 20.0, "split_ratio": 0.4, "split_time": "2025-12-19 08:35:00"},
            {"id": 3, "split_id": "SPLIT003", "fitted_path_id": "FITTED002", "toll_unit_id": "UNIT001", "split_amount": 80.0, "split_ratio": 0.67, "split_time": "2025-12-19 09:05:00"},
            {"id": 4, "split_id": "SPLIT004", "fitted_path_id": "FITTED002", "toll_unit_id": "UNIT002", "split_amount": 40.0, "split_ratio": 0.33, "split_time": "2025-12-19 09:05:00"},
            {"id": 5, "split_id": "SPLIT005", "fitted_path_id": "FITTED003", "toll_unit_id": "UNIT003", "split_amount": 274.0, "split_ratio": 1.0, "split_time": "2025-12-19 09:20:00"},
            {"id": 6, "split_id": "SPLIT006", "fitted_path_id": "FITTED004", "toll_unit_id": "UNIT003", "split_amount": 30.0, "split_ratio": 0.6, "split_time": "2025-12-19 09:45:00"},
            {"id": 7, "split_id": "SPLIT007", "fitted_path_id": "FITTED005", "toll_unit_id": "UNIT004", "split_amount": 150.0, "split_ratio": 1.0, "split_time": "2025-12-19 11:05:00"}
        ]
    }
    
    return jsonify(mock_data_by_model.get(model_id, []))

@app.route('/api/data', methods=['POST'])
def create_data_record():
    """创建数据记录"""
    data = request.get_json()
    model_id = request.args.get('modelId')
    if not model_id:
        return jsonify({"error": "modelId is required"}), 400
    
    try:
        model_id = int(model_id)
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid modelId"}), 400
    
    # 模拟创建数据记录，实际项目中应该保存到数据库
    return jsonify(data), 201

@app.route('/api/data/<int:id>', methods=['PUT'])
def update_data_record(id):
    """更新数据记录"""
    data = request.get_json()
    # 模拟更新数据记录，实际项目中应该更新数据库
    return jsonify(data)

@app.route('/api/data/<int:id>', methods=['DELETE'])
def delete_data_record(id):
    """删除数据记录"""
    # 模拟删除数据记录，实际项目中应该从数据库删除
    return jsonify({"message": "Data record deleted"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
