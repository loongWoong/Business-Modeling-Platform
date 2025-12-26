"""
Domain API路由
"""
from flask import Blueprint, request, jsonify
from application.domain_service import DomainService

domain_bp = Blueprint('domain', __name__)
service = DomainService()


@domain_bp.route('/', methods=['GET'])
def get_domains():
    """获取所有Domain"""
    result = service.get_all()
    return jsonify(result)


@domain_bp.route('/<int:domain_id>', methods=['GET'])
def get_domain(domain_id):
    """根据ID获取Domain"""
    result = service.get_by_id(domain_id)
    if not result:
        return jsonify({"error": "Domain not found"}), 404
    return jsonify(result)


@domain_bp.route('/', methods=['POST'])
def create_domain():
    """创建Domain"""
    data = request.json
    result = service.create_domain(data)
    return jsonify(result), 201


@domain_bp.route('/<int:domain_id>', methods=['PUT'])
def update_domain(domain_id):
    """更新Domain"""
    data = request.json
    result = service.update_domain(domain_id, data)
    if not result:
        return jsonify({"error": "Domain not found"}), 404
    return jsonify(result)


@domain_bp.route('/<int:domain_id>', methods=['DELETE'])
def delete_domain(domain_id):
    """删除Domain"""
    success = service.delete_domain(domain_id)
    if not success:
        return jsonify({"error": "Domain not found"}), 404
    return jsonify({"message": "Domain deleted"}), 200

