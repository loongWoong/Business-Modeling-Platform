"""
Property API路由 - 使用Service层
"""
from flask import Blueprint, jsonify, request
from service.property_service import PropertyService

property_bp = Blueprint('property', __name__)
service = PropertyService()


@property_bp.route('', methods=['GET'])
def get_properties():
    """获取属性列表"""
    model_id = request.args.get('modelId')
    try:
        model_id_int = int(model_id) if model_id else None
    except (ValueError, TypeError):
        model_id_int = None
    
    properties = service.get_all(model_id_int)
    return jsonify([p.to_dict() for p in properties])


@property_bp.route('/<int:id>', methods=['GET'])
def get_property(id):
    """获取单个属性"""
    property = service.get_by_id(id)
    if not property:
        return jsonify({"error": "Property not found"}), 404
    return jsonify(property.to_dict())


@property_bp.route('', methods=['POST'])
def create_property():
    """新建属性"""
    data = request.get_json()
    if not data or not data.get("name") or not data.get("type") or not data.get("modelId"):
        return jsonify({"error": "name, type and modelId are required"}), 400
    
    try:
        property = service.create(data)
        return jsonify(property.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@property_bp.route('/<int:id>', methods=['PUT'])
def update_property(id):
    """更新属性"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    property = service.update(id, data)
    if not property:
        return jsonify({"error": "Property not found"}), 404
    
    return jsonify(property.to_dict())


@property_bp.route('/<int:id>', methods=['DELETE'])
def delete_property(id):
    """删除属性"""
    success = service.delete(id)
    if not success:
        return jsonify({"error": "Property not found"}), 404
    return jsonify({"message": "Property deleted"})