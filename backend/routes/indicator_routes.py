"""
Indicator API路由 - 使用Service层
"""
from flask import Blueprint, jsonify, request
from service.indicator_service import IndicatorService

indicator_bp = Blueprint('indicator', __name__)
service = IndicatorService()


@indicator_bp.route('', methods=['GET'])
def get_indicators():
    """获取指标列表"""
    domain_id = request.args.get('domainId')
    try:
        domain_id_int = int(domain_id) if domain_id else None
    except (ValueError, TypeError):
        domain_id_int = None
    
    indicators = service.get_all(domain_id_int)
    return jsonify([ind.to_dict() for ind in indicators])


@indicator_bp.route('/<int:id>', methods=['GET'])
def get_indicator(id):
    """获取单个指标"""
    indicator = service.get_by_id(id)
    if not indicator:
        return jsonify({"error": "Indicator not found"}), 404
    return jsonify(indicator.to_dict())


@indicator_bp.route('', methods=['POST'])
def create_indicator():
    """新建指标"""
    data = request.get_json()
    if not data or not data.get("name") or not data.get("domainId"):
        return jsonify({"error": "name and domainId are required"}), 400
    
    try:
        indicator = service.create(data)
        return jsonify(indicator.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@indicator_bp.route('/<int:id>', methods=['PUT'])
def update_indicator(id):
    """更新指标"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    indicator = service.update(id, data)
    if not indicator:
        return jsonify({"error": "Indicator not found"}), 404
    
    return jsonify(indicator.to_dict())


@indicator_bp.route('/<int:id>', methods=['DELETE'])
def delete_indicator(id):
    """删除指标"""
    success = service.delete(id)
    if not success:
        return jsonify({"error": "Indicator not found"}), 404
    return jsonify({"message": "Indicator deleted"})


@indicator_bp.route('/<int:id>/publish', methods=['PUT'])
def publish_indicator(id):
    """发布指标"""
    indicator = service.publish(id)
    if not indicator:
        return jsonify({"error": "Indicator not found"}), 404
    return jsonify(indicator.to_dict())


@indicator_bp.route('/<int:id>/offline', methods=['PUT'])
def offline_indicator(id):
    """下线指标"""
    indicator = service.offline(id)
    if not indicator:
        return jsonify({"error": "Indicator not found"}), 404
    return jsonify(indicator.to_dict())