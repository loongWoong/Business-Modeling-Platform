from flask import Blueprint, jsonify, request
from utils import get_db_connection

relation_bp = Blueprint('relation', __name__)

@relation_bp.route('', methods=['GET'])
def get_relations():
    """获取关系列表"""
    model_id = request.args.get('modelId')
    domain_id = request.args.get('domainId')
    
    conn = get_db_connection()
    try:
        # 查询关系列表
        relations = conn.execute("SELECT * FROM relations").fetchall()
        
        # 查询所有模型，用于获取模型名称
        models = conn.execute("SELECT id, name FROM models").fetchall()
        model_dict = {row[0]: row[1] for row in models}
        
        # 为关系添加模型名称信息
        result = []
        for r in relations:
            relation_with_names = {
                "id": r[0],
                "name": r[1],
                "sourceModelId": r[2],
                "targetModelId": r[3],
                "type": r[4],
                "description": r[5],
                "enabled": r[6],
                "sourceModel": model_dict.get(r[2], "未知模型"),
                "targetModel": model_dict.get(r[3], "未知模型")
            }
            result.append(relation_with_names)
        
        # 如果relations表中没有数据，尝试从model_edges表中创建关系
        if not result and models:
            # 查询model_edges表
            model_edges = conn.execute("SELECT * FROM model_edges").fetchall()
            
            # 为每个model_edge创建一个默认关系
            for edge in model_edges:
                source_model_id = edge[0]
                target_model_id = edge[1]
                
                # 检查是否已经存在相同的关系
                existing_relation = conn.execute(
                    "SELECT * FROM relations WHERE sourceModelId = ? AND targetModelId = ?", 
                    (source_model_id, target_model_id)
                ).fetchone()
                
                if not existing_relation:
                    # 创建新关系
                    source_model_name = model_dict.get(source_model_id, f"模型{source_model_id}")
                    target_model_name = model_dict.get(target_model_id, f"模型{target_model_id}")
                    
                    # 获取下一个ID
                    next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM relations").fetchone()[0]
                    
                    # 插入新关系
                    conn.execute(
                        "INSERT INTO relations (id, name, sourceModelId, targetModelId, type, description, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)",
                        (next_id, f"{source_model_name} 到 {target_model_name} 的关系", source_model_id, target_model_id, "one-to-many", "自动生成的关系", True)
                    )
                    
                    # 添加到结果列表
                    result.append({
                        "id": next_id,
                        "name": f"{source_model_name} 到 {target_model_name} 的关系",
                        "sourceModelId": source_model_id,
                        "targetModelId": target_model_id,
                        "type": "one-to-many",
                        "description": "自动生成的关系",
                        "enabled": True,
                        "sourceModel": source_model_name,
                        "targetModel": target_model_name
                    })
        
        if model_id:
            result = [r for r in result if r["sourceModelId"] == int(model_id)]
        
        if domain_id:
            # 获取该域下的所有模型ID
            domain_model_ids = conn.execute("SELECT id FROM models WHERE domainId = ?", (int(domain_id),)).fetchall()
            domain_model_ids = [row[0] for row in domain_model_ids]
            result = [r for r in result if r["sourceModelId"] in domain_model_ids or r["targetModelId"] in domain_model_ids]
        
        return jsonify(result)
    finally:
        conn.close()

@relation_bp.route('', methods=['POST'])
def create_relation():
    """新建关系"""
    data = request.get_json()
    conn = get_db_connection()
    try:
        # 支持通过模型名称或ID创建关系
        source_model_id = data.get("sourceModelId")
        target_model_id = data.get("targetModelId")
        
        if not source_model_id and data.get("sourceModel"):
            # 通过模型名称获取ID
            source_model = conn.execute("SELECT id FROM models WHERE name = ?", (data["sourceModel"],)).fetchone()
            if source_model:
                source_model_id = source_model[0]
        
        if not target_model_id and data.get("targetModel"):
            # 通过模型名称获取ID
            target_model = conn.execute("SELECT id FROM models WHERE name = ?", (data["targetModel"],)).fetchone()
            if target_model:
                target_model_id = target_model[0]
        
        if not source_model_id or not target_model_id:
            return jsonify({"error": "Invalid source or target model"}), 400
        
        # 获取下一个ID
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM relations").fetchone()[0]
        
        # 插入新关系
        conn.execute(
            "INSERT INTO relations (id, name, sourceModelId, targetModelId, type, description, enabled) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (next_id, data["name"], source_model_id, target_model_id, data.get("type", "one-to-many"), data.get("description", ""), data.get("enabled", True))
        )
        
        # 同步更新model_edges
        conn.execute(
            "INSERT INTO model_edges (source, target) VALUES (?, ?)",
            (source_model_id, target_model_id)
        )
        
        # 获取模型名称
        source_model_name = conn.execute("SELECT name FROM models WHERE id = ?", (source_model_id,)).fetchone()[0]
        target_model_name = conn.execute("SELECT name FROM models WHERE id = ?", (target_model_id,)).fetchone()[0]
        
        # 返回新创建的关系
        new_relation = {
            "id": next_id,
            "name": data["name"],
            "sourceModelId": source_model_id,
            "targetModelId": target_model_id,
            "type": data.get("type", "one-to-many"),
            "description": data.get("description", ""),
            "enabled": data.get("enabled", True),
            "sourceModel": source_model_name,
            "targetModel": target_model_name
        }
        
        return jsonify(new_relation), 201
    finally:
        conn.close()

@relation_bp.route('/<int:id>', methods=['PUT'])
def update_relation(id):
    """更新关系"""
    data = request.get_json()
    conn = get_db_connection()
    try:
        # 检查关系是否存在
        existing_relation = conn.execute("SELECT * FROM relations WHERE id = ?", (id,)).fetchone()
        if not existing_relation:
            return jsonify({"error": "Relation not found"}), 404
        
        # 更新目标模型ID
        target_model_id = existing_relation[3]
        if data.get("targetModelId"):
            target_model_id = data["targetModelId"]
        elif data.get("targetModel"):
            # 通过模型名称获取ID
            target_model = conn.execute("SELECT id FROM models WHERE name = ?", (data["targetModel"],)).fetchone()
            if target_model:
                target_model_id = target_model[0]
        
        # 更新关系
        conn.execute(
            "UPDATE relations SET name = ?, targetModelId = ?, type = ?, description = ?, enabled = ? WHERE id = ?",
            (data.get("name", existing_relation[1]), target_model_id, data.get("type", existing_relation[4]), data.get("description", existing_relation[5]), data.get("enabled", existing_relation[6]), id)
        )
        
        # 获取模型名称
        source_model_name = conn.execute("SELECT name FROM models WHERE id = ?", (existing_relation[2],)).fetchone()[0]
        target_model_name = conn.execute("SELECT name FROM models WHERE id = ?", (target_model_id,)).fetchone()[0]
        
        # 返回更新后的关系
        updated_relation = {
            "id": id,
            "name": data.get("name", existing_relation[1]),
            "sourceModelId": existing_relation[2],
            "targetModelId": target_model_id,
            "type": data.get("type", existing_relation[4]),
            "description": data.get("description", existing_relation[5]),
            "enabled": data.get("enabled", existing_relation[6]),
            "sourceModel": source_model_name,
            "targetModel": target_model_name
        }
        
        return jsonify(updated_relation)
    finally:
        conn.close()

@relation_bp.route('/<int:id>', methods=['DELETE'])
def delete_relation(id):
    """删除关系"""
    conn = get_db_connection()
    try:
        # 先获取关系信息，用于后续删除model_edges
        relation = conn.execute("SELECT sourceModelId, targetModelId FROM relations WHERE id = ?", (id,)).fetchone()
        if relation:
            source_model_id = relation[0]
            target_model_id = relation[1]
            
            # 删除关系
            conn.execute("DELETE FROM relations WHERE id = ?", (id,))
            
            # 同步删除model_edges中的对应边
            conn.execute("DELETE FROM model_edges WHERE source = ? AND target = ?", (source_model_id, target_model_id))
        
        return jsonify({"message": "Relation deleted", "success": True})
    finally:
        conn.close()

@relation_bp.route('/<int:id>/toggle', methods=['PUT'])
def toggle_relation(id):
    """启用/禁用关系"""
    conn = get_db_connection()
    try:
        # 检查关系是否存在
        relation = conn.execute("SELECT * FROM relations WHERE id = ?", (id,)).fetchone()
        if not relation:
            return jsonify({"error": "Relation not found"}), 404
        
        # 切换启用状态
        new_enabled = not relation[6]
        conn.execute("UPDATE relations SET enabled = ? WHERE id = ?", (new_enabled, id))
        
        # 获取模型名称
        source_model_name = conn.execute("SELECT name FROM models WHERE id = ?", (relation[2],)).fetchone()[0]
        target_model_name = conn.execute("SELECT name FROM models WHERE id = ?", (relation[3],)).fetchone()[0]
        
        # 返回更新后的关系
        updated_relation = {
            "id": id,
            "name": relation[1],
            "sourceModelId": relation[2],
            "targetModelId": relation[3],
            "type": relation[4],
            "description": relation[5],
            "enabled": new_enabled,
            "sourceModel": source_model_name,
            "targetModel": target_model_name
        }
        
        return jsonify(updated_relation)
    finally:
        conn.close()
