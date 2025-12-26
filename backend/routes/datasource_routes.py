"""
Datasource API路由 - 使用Service层
"""
from flask import Blueprint, jsonify, request
from service.datasource_service import DatasourceService

datasource_bp = Blueprint('datasource', __name__)
service = DatasourceService()


@datasource_bp.route('', methods=['GET'])
def get_datasources():
    """获取数据源列表"""
    model_id = request.args.get('modelId')
    domain_id = request.args.get('domainId')
    
    try:
        model_id_int = int(model_id) if model_id and model_id.strip() else None
        domain_id_int = int(domain_id) if domain_id else None
    except (ValueError, TypeError):
        model_id_int = None
        domain_id_int = None
    
    datasources = service.get_all(model_id_int, domain_id_int)
    return jsonify([ds.to_dict() for ds in datasources])


@datasource_bp.route('/<int:id>', methods=['GET'])
def get_datasource(id):
    """获取单个数据源"""
    datasource = service.get_by_id(id)
    if not datasource:
        return jsonify({"error": "Datasource not found"}), 404
    return jsonify(datasource.to_dict())


@datasource_bp.route('', methods=['POST'])
def create_datasource():
    """新建数据源"""
    data = request.get_json()
    if not data or not data.get("name") or not data.get("type") or not data.get("url"):
        return jsonify({"error": "name, type and url are required"}), 400
    
    try:
        datasource = service.create(data)
        return jsonify(datasource.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@datasource_bp.route('/<int:id>', methods=['PUT'])
def update_datasource(id):
    """更新数据源"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    datasource = service.update(id, data)
    if not datasource:
        return jsonify({"error": "Datasource not found"}), 404
    
    return jsonify(datasource.to_dict())


@datasource_bp.route('/<int:id>', methods=['DELETE'])
def delete_datasource(id):
    """删除数据源"""
    success = service.delete(id)
    if not success:
        return jsonify({"error": "Datasource not found"}), 404
    return jsonify({"message": "Datasource deleted"})


@datasource_bp.route('/<int:id>/toggle', methods=['PUT'])
def toggle_datasource(id):
    """切换数据源状态"""
    datasource = service.toggle_status(id)
    if not datasource:
        return jsonify({"error": "Datasource not found"}), 404
    return jsonify(datasource.to_dict())


@datasource_bp.route('/<int:id>/test', methods=['POST'])
def test_datasource(id):
    """测试数据源连接"""
    result = service.test_connection(id)
    return jsonify(result)