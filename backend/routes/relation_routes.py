"""
Relation API路由 - 使用Service层
"""
from flask import Blueprint, jsonify, request
from service.relation_service import RelationService

relation_bp = Blueprint('relation', __name__)
service = RelationService()


@relation_bp.route('', methods=['GET'])
def get_relations():
    """获取关系列表"""
    model_id = request.args.get('modelId')
    domain_id = request.args.get('domainId')
    
    try:
        model_id_int = int(model_id) if model_id else None
        domain_id_int = int(domain_id) if domain_id else None
    except (ValueError, TypeError):
        model_id_int = None
        domain_id_int = None
    
    relations = service.get_all(model_id_int, domain_id_int)
    
    # 添加模型名称信息
    from repository.model_repository import ModelRepository
    model_repo = ModelRepository()
    model_dict = {m.id: m.name for m in model_repo.find_all()}
    
    result = []
    for r in relations:
        rel_dict = r.to_dict()
        rel_dict["sourceModel"] = model_dict.get(r.sourceModelId, "未知模型")
        rel_dict["targetModel"] = model_dict.get(r.targetModelId, "未知模型")
        result.append(rel_dict)
    
    return jsonify(result)


@relation_bp.route('/<int:id>', methods=['GET'])
def get_relation(id):
    """获取单个关系"""
    relation = service.get_by_id(id)
    if not relation:
        return jsonify({"error": "Relation not found"}), 404
    return jsonify(relation.to_dict())


@relation_bp.route('', methods=['POST'])
def create_relation():
    """新建关系"""
    data = request.get_json()
    if not data or not data.get("name") or not data.get("sourceModelId") or not data.get("targetModelId"):
        return jsonify({"error": "name, sourceModelId and targetModelId are required"}), 400
    
    try:
        relation = service.create(data)
        return jsonify(relation.to_dict()), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@relation_bp.route('/<int:id>', methods=['PUT'])
def update_relation(id):
    """更新关系"""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    relation = service.update(id, data)
    if not relation:
        return jsonify({"error": "Relation not found"}), 404
    
    return jsonify(relation.to_dict())


@relation_bp.route('/<int:id>', methods=['DELETE'])
def delete_relation(id):
    """删除关系"""
    success = service.delete(id)
    if not success:
        return jsonify({"error": "Relation not found"}), 404
    return jsonify({"message": "Relation deleted", "success": True})


@relation_bp.route('/<int:id>/toggle', methods=['PUT'])
def toggle_relation(id):
    """启用/禁用关系"""
    relation = service.toggle(id)
    if not relation:
        return jsonify({"error": "Relation not found"}), 404
    return jsonify(relation.to_dict())