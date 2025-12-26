"""
SharedAttribute API路由 - 使用Service层
"""
from flask import Blueprint, jsonify, request
from service.shared_attribute_service import SharedAttributeService

shared_attribute_bp = Blueprint('shared-attribute', __name__)
service = SharedAttributeService()


@shared_attribute_bp.route('', methods=['GET'])
def get_shared_attributes():
    """获取共享属性列表"""
    domain_id = request.args.get('domainId')
    try:
        domain_id_int = int(domain_id) if domain_id else None
    except (ValueError, TypeError):
        domain_id_int = None
    
    attributes = service.get_all(domain_id_int)
    return jsonify([attr.to_dict() for attr in attributes])


@shared_attribute_bp.route('/<int:id>', methods=['GET'])
def get_shared_attribute(id):
    """获取单个共享属性"""
    attr = service.get_by_id(id)
    if not attr:
        return jsonify({"error": "SharedAttribute not found"}), 404
    return jsonify(attr.to_dict())


@shared_attribute_bp.route('', methods=['POST'])
def create_shared_attribute():
    """新建共享属性"""
    data = request.get_json()
    if not data or not data.get("name") or not data.get("type") or not data.get("domainId"):
        return jsonify({"error": "name, type and domainId are required"}), 400
    
    try:
        attr = service.create(data)
        return jsonify(attr.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@shared_attribute_bp.route('/<int:id>', methods=['PUT'])
def update_shared_attribute(id):
    """更新共享属性"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    attr = service.update(id, data)
    if not attr:
        return jsonify({"error": "SharedAttribute not found"}), 404
    
    return jsonify(attr.to_dict())


@shared_attribute_bp.route('/<int:id>', methods=['DELETE'])
def delete_shared_attribute(id):
    """删除共享属性"""
    success = service.delete(id)
    if not success:
        return jsonify({"error": "SharedAttribute not found"}), 404
    return jsonify({"message": "SharedAttribute deleted"})