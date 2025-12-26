"""
Model API路由
"""
from flask import Blueprint, request, jsonify
from application.model_service import ModelService

model_bp = Blueprint('model', __name__)
service = ModelService()


@model_bp.route('', methods=['GET'])
def get_models():
    """获取所有Model"""
    domain_id = request.args.get('domainId', type=int)
    result = service.get_all(domain_id)
    return jsonify(result)


@model_bp.route('/<int:model_id>', methods=['GET'])
def get_model(model_id):
    """根据ID获取Model"""
    result = service.get_by_id(model_id)
    if not result:
        return jsonify({"error": "Model not found"}), 404
    return jsonify(result)


@model_bp.route('', methods=['POST'])
def create_model():
    """创建Model"""
    data = request.json
    try:
        result = service.create_model(data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@model_bp.route('/<int:model_id>', methods=['PUT'])
def update_model(model_id):
    """更新Model"""
    data = request.json
    result = service.update_model(model_id, data)
    if not result:
        return jsonify({"error": "Model not found"}), 404
    return jsonify(result)


@model_bp.route('/<int:model_id>', methods=['DELETE'])
def delete_model(model_id):
    """删除Model"""
    success = service.delete_model(model_id)
    if not success:
        return jsonify({"error": "Model not found"}), 404
    return jsonify({"message": "Model deleted"}), 200


@model_bp.route('/<int:model_id>/properties', methods=['POST'])
def add_property(model_id):
    """添加Property到Model"""
    data = request.json
    try:
        result = service.add_property(model_id, data)
        if not result:
            return jsonify({"error": "Model not found"}), 404
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@model_bp.route('/<int:model_id>/properties/<int:property_id>', methods=['DELETE'])
def remove_property(model_id, property_id):
    """从Model移除Property"""
    success = service.remove_property(model_id, property_id)
    if not success:
        return jsonify({"error": "Model or Property not found"}), 404
    return jsonify({"message": "Property removed"}), 200


@model_bp.route('/relations', methods=['POST'])
def add_relation():
    """添加Relation"""
    data = request.json
    try:
        result = service.add_relation(data)
        if not result:
            return jsonify({"error": "Source Model not found"}), 404
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@model_bp.route('/relations/<int:relation_id>', methods=['DELETE'])
def remove_relation(relation_id):
    """删除Relation"""
    success = service.remove_relation(relation_id)
    if not success:
        return jsonify({"error": "Relation not found"}), 404
    return jsonify({"message": "Relation removed"}), 200

