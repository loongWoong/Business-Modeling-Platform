from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

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
        {"id": 1, "name": "业主ID", "type": "string", "required": True, "description": "路段业主唯一标识", "modelId": 1},
        {"id": 2, "name": "业主名称", "type": "string", "required": True, "description": "路段业主名称", "modelId": 1},
        {"id": 3, "name": "联系方式", "type": "string", "required": True, "description": "业主联系方式", "modelId": 1},
        
        # 收费公路属性
        {"id": 4, "name": "公路ID", "type": "string", "required": True, "description": "收费公路唯一标识", "modelId": 2},
        {"id": 5, "name": "公路名称", "type": "string", "required": True, "description": "收费公路名称", "modelId": 2},
        {"id": 6, "name": "所属业主", "type": "string", "required": True, "description": "所属路段业主ID", "modelId": 2},
        {"id": 7, "name": "公路等级", "type": "string", "required": True, "description": "公路等级", "modelId": 2},
        {"id": 8, "name": "起始里程", "type": "number", "required": True, "description": "起始里程", "modelId": 2},
        {"id": 9, "name": "结束里程", "type": "number", "required": True, "description": "结束里程", "modelId": 2},
        
        # 收费站属性
        {"id": 10, "name": "收费站ID", "type": "string", "required": True, "description": "收费站唯一标识", "modelId": 3},
        {"id": 11, "name": "收费站名称", "type": "string", "required": True, "description": "收费站名称", "modelId": 3},
        {"id": 12, "name": "所属公路", "type": "string", "required": True, "description": "所属收费公路ID", "modelId": 3},
        {"id": 13, "name": "收费站类型", "type": "string", "required": True, "description": "收费站类型", "modelId": 3},
        
        # ETC门架属性
        {"id": 14, "name": "门架ID", "type": "string", "required": True, "description": "ETC门架唯一标识", "modelId": 4},
        {"id": 15, "name": "门架名称", "type": "string", "required": True, "description": "ETC门架名称", "modelId": 4},
        {"id": 16, "name": "所属公路", "type": "string", "required": True, "description": "所属收费公路ID", "modelId": 4},
        {"id": 17, "name": "门架位置", "type": "string", "required": True, "description": "门架位置", "modelId": 4},
        {"id": 18, "name": "门架状态", "type": "string", "required": True, "description": "门架运行状态", "modelId": 4},
        
        # 收费单元属性
        {"id": 19, "name": "收费单元ID", "type": "string", "required": True, "description": "收费单元唯一标识", "modelId": 5},
        {"id": 20, "name": "收费单元名称", "type": "string", "required": True, "description": "收费单元名称", "modelId": 5},
        {"id": 21, "name": "所属公路", "type": "string", "required": True, "description": "所属收费公路ID", "modelId": 5},
        {"id": 22, "name": "收费类型", "type": "string", "required": True, "description": "收费类型", "modelId": 5},
        
        # 车道属性
        {"id": 23, "name": "车道ID", "type": "string", "required": True, "description": "车道唯一标识", "modelId": 6},
        {"id": 24, "name": "车道编号", "type": "string", "required": True, "description": "车道编号", "modelId": 6},
        {"id": 25, "name": "所属收费站", "type": "string", "required": True, "description": "所属收费站ID", "modelId": 6},
        {"id": 26, "name": "车道类型", "type": "string", "required": True, "description": "车道类型（ETC、人工等）", "modelId": 6},
        {"id": 27, "name": "车道状态", "type": "string", "required": True, "description": "车道运行状态", "modelId": 6},
        
        # 标识点属性
        {"id": 28, "name": "标识点ID", "type": "string", "required": True, "description": "标识点唯一标识", "modelId": 7},
        {"id": 29, "name": "标识点名称", "type": "string", "required": True, "description": "标识点名称", "modelId": 7},
        {"id": 30, "name": "经度", "type": "number", "required": True, "description": "标识点经度", "modelId": 7},
        {"id": 31, "name": "纬度", "type": "number", "required": True, "description": "标识点纬度", "modelId": 7},
        {"id": 32, "name": "标识点类型", "type": "string", "required": True, "description": "标识点类型", "modelId": 7}
    ],
    "relations": [
        # 车辆 - 通行介质
        {"id": 1, "name": "持有", "targetModel": "通行介质", "type": "one-to-many", "description": "车辆持有多个通行介质", "sourceModelId": 8},
        # 车辆 - 交易流水
        {"id": 2, "name": "关联", "targetModel": "交易流水", "type": "one-to-many", "description": "车辆关联多个交易流水", "sourceModelId": 8},
        # 路段业主 - 收费公路
        {"id": 3, "name": "管理", "targetModel": "收费公路", "type": "one-to-many", "description": "路段业主管理多个收费公路", "sourceModelId": 1},
        # 收费公路 - 收费站
        {"id": 4, "name": "包含", "targetModel": "收费站", "type": "one-to-many", "description": "收费公路包含多个收费站", "sourceModelId": 2},
        # 收费公路 - ETC门架
        {"id": 5, "name": "包含", "targetModel": "ETC门架", "type": "one-to-many", "description": "收费公路包含多个ETC门架", "sourceModelId": 2},
        # 收费公路 - 收费单元
        {"id": 6, "name": "包含", "targetModel": "收费单元", "type": "one-to-many", "description": "收费公路包含多个收费单元", "sourceModelId": 2},
        # ETC门架 - 收费单元
        {"id": 7, "name": "代收", "targetModel": "收费单元", "type": "one-to-many", "description": "ETC门架代收多个收费单元", "sourceModelId": 4},
        # 收费站 - 车道
        {"id": 8, "name": "包含", "targetModel": "车道", "type": "one-to-many", "description": "收费站包含多个车道", "sourceModelId": 3},
        # ETC门架 - 标识点
        {"id": 9, "name": "继承", "targetModel": "标识点", "type": "one-to-one", "description": "ETC门架对应一个标识点", "sourceModelId": 4},
        # 车道 - 标识点
        {"id": 10, "name": "继承", "targetModel": "标识点", "type": "one-to-one", "description": "车道对应一个标识点", "sourceModelId": 6},
        # 标识点 - 交易流水
        {"id": 11, "name": "生成", "targetModel": "交易流水", "type": "one-to-many", "description": "标识点生成多个交易流水", "sourceModelId": 7},
        # 交易流水 - 车辆通行路径
        {"id": 12, "name": "汇聚为", "targetModel": "车辆通行路径", "type": "many-to-one", "description": "多个交易流水汇聚为一个车辆通行路径", "sourceModelId": 10},
        # 车辆通行路径 - 通行拟合路径
        {"id": 13, "name": "拟合为", "targetModel": "通行拟合路径", "type": "one-to-one", "description": "车辆通行路径拟合为一个通行拟合路径", "sourceModelId": 11},
        # 通行拟合路径 - 拆分明细
        {"id": 14, "name": "拆分为", "targetModel": "拆分明细", "type": "one-to-many", "description": "通行拟合路径拆分为多个拆分明细", "sourceModelId": 12},
        # 收费单元 - 拆分明细
        {"id": 15, "name": "关联", "targetModel": "拆分明细", "type": "one-to-one", "description": "收费单元关联一个拆分明细", "sourceModelId": 5}
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
        "modelId": int(data["modelId"])
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
    if model_id:
        return jsonify([r for r in mock_data["relations"] if r["sourceModelId"] == int(model_id)])
    return jsonify(mock_data["relations"])

if __name__ == '__main__':
    app.run(debug=True, port=5000)
