"""
Domain API路由 - 使用Service层
"""
from flask import Blueprint, jsonify, request
from service.domain_service import DomainService

domain_bp = Blueprint('domain', __name__)
service = DomainService()


@domain_bp.route('/list', methods=['GET'])
def get_domain_list():
    """获取域列表和边"""
    result = service.get_all()
    return jsonify(result)


@domain_bp.route('', methods=['POST'])
def create_domain():
    """新建域"""
    data = request.get_json()
    if not data or not data.get("name"):
        return jsonify({"error": "name is required"}), 400
    
    try:
        domain = service.create(data)
        return jsonify(domain.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@domain_bp.route('/<int:id>', methods=['GET'])
def get_domain(id):
    """获取单个域"""
    domain = service.get_by_id(id)
    if not domain:
        return jsonify({"error": "Domain not found"}), 404
    return jsonify(domain.to_dict())


@domain_bp.route('/<int:id>', methods=['PUT'])
def update_domain(id):
    """更新域"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    domain = service.update(id, data)
    if not domain:
        return jsonify({"error": "Domain not found"}), 404
    
    return jsonify(domain.to_dict())


@domain_bp.route('/<int:id>', methods=['DELETE'])
def delete_domain(id):
    """删除域"""
    success = service.delete(id)
    if not success:
        return jsonify({"error": "Domain not found"}), 404
    return jsonify({"message": "Domain deleted"})