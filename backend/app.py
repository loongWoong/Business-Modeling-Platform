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
        {"id": 32, "name": "标识点类型", "type": "string", "required": True, "description": "标识点类型", "modelId": 7, "isPrimaryKey": False, "isForeignKey": False, "defaultValue": None, "constraints": ["NOT NULL", "IN(入口, 出口, 中间点)"], "sensitivityLevel": "public", "maskRule": None, "physicalColumn": "marker_type"}
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
        {"id": 1, "name": "MySQL数据库", "type": "mysql", "url": "jdbc:mysql://localhost:3306/expressway", "tableName": "t_vehicle", "status": "active", "description": "车辆信息表", "modelId": 8, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        {"id": 2, "name": "Oracle数据库", "type": "oracle", "url": "jdbc:oracle:thin:@localhost:1521:ORCL", "tableName": "t_pass_record", "status": "active", "description": "通行记录表", "modelId": 10, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"},
        {"id": 3, "name": "Kafka消息队列", "type": "kafka", "url": "localhost:9092", "tableName": "pass_events", "status": "inactive", "description": "通行事件流", "modelId": 10, "createdAt": "2025-12-22", "updatedAt": "2025-12-22"}
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
    if model_id:
        return jsonify([d for d in mock_data["datasources"] if d["modelId"] == int(model_id)])
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
    # 模拟数据，实际项目中应该根据modelId从数据库获取数据
    mock_data_records = [
        {"id": 1, "licensePlate": "京A12345", "vehicleType": "小型客车", "entryTime": "2025-12-19 08:00:00", "exitTime": "2025-12-19 08:30:00", "tollFee": 50.0},
        {"id": 2, "licensePlate": "沪B67890", "vehicleType": "大型货车", "entryTime": "2025-12-19 08:15:00", "exitTime": "2025-12-19 09:00:00", "tollFee": 120.0},
        {"id": 3, "licensePlate": "粤C54321", "vehicleType": "小型客车", "entryTime": "2025-12-19 08:30:00", "exitTime": "2025-12-19 09:15:00", "tollFee": 80.0}
    ]
    return jsonify(mock_data_records)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
