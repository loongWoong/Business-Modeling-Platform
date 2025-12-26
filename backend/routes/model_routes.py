"""
Model API路由 - 使用Service层
"""
from flask import Blueprint, jsonify, request
from service.model_service import ModelService

model_bp = Blueprint('model', __name__)
service = ModelService()


@model_bp.route('', methods=['GET'])
def get_models():
    """获取模型列表"""
    domain_id = request.args.get('domainId')
    try:
        domain_id_int = int(domain_id) if domain_id else None
    except (ValueError, TypeError):
        domain_id_int = None
    
    result = service.get_all(domain_id_int)
    return jsonify(result)


@model_bp.route('', methods=['POST'])
def create_model():
    """新建模型"""
    data = request.get_json()
    if not data or not data.get("name") or not data.get("code"):
        return jsonify({"error": "name and code are required"}), 400
    
    try:
        model = service.create(data)
        return jsonify(model.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@model_bp.route('/<int:id>', methods=['GET'])
def get_model(id):
    """获取单个模型"""
    model = service.get_by_id(id)
    if not model:
        return jsonify({"error": "Model not found"}), 404
    return jsonify(model.to_dict())


@model_bp.route('/<int:id>', methods=['PUT'])
def update_model(id):
    """更新模型"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    model = service.update(id, data)
    if not model:
        return jsonify({"error": "Model not found"}), 404
    
    return jsonify(model.to_dict())


@model_bp.route('/<int:id>', methods=['DELETE'])
def delete_model(id):
    """删除模型"""
    success = service.delete(id)
    if not success:
        return jsonify({"error": "Model not found"}), 404
    return jsonify({"message": "Model deleted"})