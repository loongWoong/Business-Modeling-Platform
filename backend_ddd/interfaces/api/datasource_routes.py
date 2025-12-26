"""
Datasource API路由
"""
from flask import Blueprint, request, jsonify
from application.datasource_service import DatasourceService

datasource_bp = Blueprint('datasource', __name__)
service = DatasourceService()


@datasource_bp.route('', methods=['GET'])
def get_datasources():
    """获取所有Datasource"""
    domain_id = request.args.get('domainId', type=int)
    result = service.get_all(domain_id)
    return jsonify(result)


@datasource_bp.route('/<int:datasource_id>', methods=['GET'])
def get_datasource(datasource_id):
    """根据ID获取Datasource"""
    result = service.get_by_id(datasource_id)
    if not result:
        return jsonify({"error": "Datasource not found"}), 404
    return jsonify(result)


@datasource_bp.route('', methods=['POST'])
def create_datasource():
    """创建Datasource"""
    data = request.json
    try:
        result = service.create_datasource(data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@datasource_bp.route('/<int:datasource_id>', methods=['PUT'])
def update_datasource(datasource_id):
    """更新Datasource"""
    data = request.json
    result = service.update_datasource(datasource_id, data)
    if not result:
        return jsonify({"error": "Datasource not found"}), 404
    return jsonify(result)


@datasource_bp.route('/<int:datasource_id>/toggle-status', methods=['POST'])
def toggle_status(datasource_id):
    """切换Datasource状态"""
    result = service.toggle_status(datasource_id)
    if not result:
        return jsonify({"error": "Datasource not found"}), 404
    return jsonify(result)


@datasource_bp.route('/<int:datasource_id>/mappings', methods=['POST'])
def add_mapping(datasource_id):
    """添加Mapping到Datasource"""
    data = request.json
    try:
        result = service.add_mapping(datasource_id, data)
        if not result:
            return jsonify({"error": "Datasource not found"}), 404
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@datasource_bp.route('/<int:datasource_id>/associations', methods=['POST'])
def add_association(datasource_id):
    """添加ModelTableAssociation到Datasource"""
    data = request.json
    try:
        result = service.add_association(datasource_id, data)
        if not result:
            return jsonify({"error": "Datasource not found"}), 404
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@datasource_bp.route('/<int:datasource_id>', methods=['DELETE'])
def delete_datasource(datasource_id):
    """删除Datasource"""
    success = service.delete_datasource(datasource_id)
    if not success:
        return jsonify({"error": "Datasource not found"}), 404
    return jsonify({"message": "Datasource deleted"}), 200

