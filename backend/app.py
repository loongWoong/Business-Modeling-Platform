from flask import Flask, jsonify, request
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

# 模拟数据库 - 高速收费业务场景
mock_data = {
    "domains": [
        {"id": 1, "name": "收费域", "description": "管理高速公路收费相关业务", "owner": "收费管理部", "updatedAt": "2025-12-19"},
        {"id": 2, "name": "车辆域", "description": "管理车辆相关信息", "owner": "车辆管理部", "updatedAt": "2025-12-18"},
        {"id": 3, "name": "路段域", "description": "管理高速公路路段信息", "owner": "路段管理部", "updatedAt": "2025-12-17"},
        {"id": 4, "name": "客户域", "description": "管理高速公路客户信息", "owner": "客户服务部", "updatedAt": "2025-12-16"},
        {"id": 5, "name": "支付域", "description": "管理收费支付相关业务", "owner": "财务管理部", "updatedAt": "2025-12-15"}
    ],
    "domain_edges": [
        {"source": 1, "target": 2},
        {"source": 1, "target": 3},
        {"source": 1, "target": 4},
        {"source": 1, "target": 5},
        {"source": 4, "target": 5}
    ],
    "models": [
        {"id": 1, "name": "收费规则", "description": "高速公路收费规则定义", "creator": "收费管理部", "updatedAt": "2025-12-19", "domainId": 1},
        {"id": 2, "name": "通行记录", "description": "车辆通行记录信息", "creator": "收费管理部", "updatedAt": "2025-12-18", "domainId": 1},
        {"id": 3, "name": "账单", "description": "收费账单信息", "creator": "收费管理部", "updatedAt": "2025-12-17", "domainId": 1},
        {"id": 4, "name": "车辆信息", "description": "车辆基本信息", "creator": "车辆管理部", "updatedAt": "2025-12-16", "domainId": 2},
        {"id": 5, "name": "车型", "description": "车辆类型定义", "creator": "车辆管理部", "updatedAt": "2025-12-15", "domainId": 2},
        {"id": 6, "name": "路段信息", "description": "高速公路路段详细信息", "creator": "路段管理部", "updatedAt": "2025-12-14", "domainId": 3},
        {"id": 7, "name": "收费站", "description": "高速公路收费站信息", "creator": "路段管理部", "updatedAt": "2025-12-13", "domainId": 3},
        {"id": 8, "name": "客户信息", "description": "高速公路客户基本信息", "creator": "客户服务部", "updatedAt": "2025-12-12", "domainId": 4},
        {"id": 9, "name": "支付记录", "description": "收费支付记录", "creator": "财务管理部", "updatedAt": "2025-12-11", "domainId": 5},
        {"id": 10, "name": "支付方式", "description": "支付方式定义", "creator": "财务管理部", "updatedAt": "2025-12-10", "domainId": 5}
    ],
    "model_edges": [
        {"source": 1, "target": 2},
        {"source": 1, "target": 3},
        {"source": 2, "target": 3},
        {"source": 2, "target": 4},
        {"source": 4, "target": 5},
        {"source": 2, "target": 6},
        {"source": 6, "target": 7},
        {"source": 3, "target": 8},
        {"source": 3, "target": 9},
        {"source": 9, "target": 10}
    ],
    "properties": [
        # 收费规则属性
        {"id": 1, "name": "规则ID", "type": "string", "required": True, "description": "收费规则唯一标识", "modelId": 1},
        {"id": 2, "name": "规则名称", "type": "string", "required": True, "description": "收费规则名称", "modelId": 1},
        {"id": 3, "name": "车型", "type": "string", "required": True, "description": "适用车型", "modelId": 1},
        {"id": 4, "name": "费率", "type": "number", "required": True, "description": "每公里收费金额", "modelId": 1},
        {"id": 5, "name": "生效日期", "type": "date", "required": True, "description": "规则生效日期", "modelId": 1},
        {"id": 6, "name": "失效日期", "type": "date", "required": False, "description": "规则失效日期", "modelId": 1},
        
        # 车辆信息属性
        {"id": 7, "name": "车辆ID", "type": "string", "required": True, "description": "车辆唯一标识", "modelId": 4},
        {"id": 8, "name": "车牌号", "type": "string", "required": True, "description": "车辆牌照号码", "modelId": 4},
        {"id": 9, "name": "车型", "type": "string", "required": True, "description": "车辆类型", "modelId": 4},
        {"id": 10, "name": "车辆颜色", "type": "string", "required": False, "description": "车辆颜色", "modelId": 4},
        {"id": 11, "name": "所属客户", "type": "string", "required": False, "description": "车辆所属客户", "modelId": 4},
        
        # 路段信息属性
        {"id": 12, "name": "路段ID", "type": "string", "required": True, "description": "路段唯一标识", "modelId": 6},
        {"id": 13, "name": "路段名称", "type": "string", "required": True, "description": "路段名称", "modelId": 6},
        {"id": 14, "name": "起点", "type": "string", "required": True, "description": "路段起点", "modelId": 6},
        {"id": 15, "name": "终点", "type": "string", "required": True, "description": "路段终点", "modelId": 6},
        {"id": 16, "name": "长度", "type": "number", "required": True, "description": "路段长度（公里）", "modelId": 6},
        {"id": 17, "name": "车道数", "type": "number", "required": True, "description": "车道数量", "modelId": 6},
        
        # 客户信息属性
        {"id": 18, "name": "客户ID", "type": "string", "required": True, "description": "客户唯一标识", "modelId": 8},
        {"id": 19, "name": "客户名称", "type": "string", "required": True, "description": "客户名称", "modelId": 8},
        {"id": 20, "name": "证件类型", "type": "string", "required": True, "description": "客户证件类型", "modelId": 8},
        {"id": 21, "name": "证件号码", "type": "string", "required": True, "description": "客户证件号码", "modelId": 8},
        {"id": 22, "name": "联系电话", "type": "string", "required": True, "description": "客户联系电话", "modelId": 8},
        {"id": 23, "name": "邮箱", "type": "string", "required": False, "description": "客户邮箱地址", "modelId": 8}
    ],
    "relations": [
        {"id": 1, "name": "适用于", "targetModel": "通行记录", "type": "one-to-many", "description": "收费规则适用于通行记录", "sourceModelId": 1},
        {"id": 2, "name": "生成", "targetModel": "账单", "type": "one-to-one", "description": "通行记录生成账单", "sourceModelId": 2},
        {"id": 3, "name": "包含", "targetModel": "车辆信息", "type": "many-to-one", "description": "通行记录包含车辆信息", "sourceModelId": 2},
        {"id": 4, "name": "属于", "targetModel": "车型", "type": "many-to-one", "description": "车辆信息属于某种车型", "sourceModelId": 4},
        {"id": 5, "name": "经过", "targetModel": "路段信息", "type": "many-to-one", "description": "通行记录经过路段信息", "sourceModelId": 2},
        {"id": 6, "name": "包含", "targetModel": "收费站", "type": "one-to-many", "description": "路段信息包含收费站", "sourceModelId": 6},
        {"id": 7, "name": "属于", "targetModel": "客户信息", "type": "many-to-one", "description": "账单属于客户信息", "sourceModelId": 3},
        {"id": 8, "name": "对应", "targetModel": "支付记录", "type": "one-to-one", "description": "账单对应支付记录", "sourceModelId": 3},
        {"id": 9, "name": "使用", "targetModel": "支付方式", "type": "many-to-one", "description": "支付记录使用支付方式", "sourceModelId": 9}
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
    return jsonify(mock_data["models"])

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
