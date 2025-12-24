from flask import Blueprint, jsonify, request
from utils import get_db_connection, get_current_date, test_database_connection, get_database_tables

datasource_bp = Blueprint('datasource', __name__)

@datasource_bp.route('', methods=['GET'])
def get_datasources():
    """获取数据源列表"""
    model_id = request.args.get('modelId')
    conn = get_db_connection()
    try:
        if model_id and model_id.strip():
            try:
                model_id_int = int(model_id)
                # 查询指定模型的数据源
                datasources = conn.execute("SELECT * FROM datasources WHERE modelId = ?", (model_id_int,)).fetchall()
            except (ValueError, TypeError) as e:
                # 如果modelId不是有效整数，返回所有数据源
                datasources = conn.execute("SELECT * FROM datasources").fetchall()
        else:
            # 返回所有数据源
            datasources = conn.execute("SELECT * FROM datasources").fetchall()
        
        # 转换为字典列表
        result = []
        for row in datasources:
            result.append({
                "id": row[0],
                "name": row[1],
                "type": row[2],
                "url": row[3],
                "tableName": row[4],
                "status": row[5],
                "description": row[6],
                "modelId": row[7],
                "domainId": row[8],
                "createdAt": row[9],
                "updatedAt": row[10]
            })
        
        return jsonify(result)
    finally:
        conn.close()

@datasource_bp.route('', methods=['POST'])
def create_datasource():
    """新建数据源"""
    data = request.get_json()
    conn = get_db_connection()
    try:
        # 获取下一个ID
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM datasources").fetchone()[0]
        
        # 处理modelId，允许为null
        model_id = data.get("modelId")
        if model_id is not None and model_id != '':
            model_id = int(model_id)
        else:
            model_id = None
        
        # 处理domainId，必须提供
        domain_id = data.get("domainId")
        if domain_id is None or domain_id == '':
            return jsonify({"error": "domainId is required"}), 400
        domain_id = int(domain_id)
        
        # 插入新数据源，包含domainId字段
        conn.execute(
            "INSERT INTO datasources (id, name, type, url, tableName, status, description, modelId, domainId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (next_id, data["name"], data.get("type", "mysql"), data.get("url", ""), data.get("tableName", ""), data.get("status", "inactive"), data.get("description", ""), model_id, domain_id, get_current_date(), get_current_date())
        )
        
        # 返回新创建的数据源
        new_datasource = {
            "id": next_id,
            "name": data["name"],
            "type": data.get("type", "mysql"),
            "url": data.get("url", ""),
            "tableName": data.get("tableName", ""),
            "status": data.get("status", "inactive"),
            "description": data.get("description", ""),
            "modelId": model_id,
            "domainId": domain_id,
            "createdAt": get_current_date(),
            "updatedAt": get_current_date()
        }
        return jsonify(new_datasource), 201
    finally:
        conn.close()

@datasource_bp.route('/<int:id>', methods=['PUT'])
def update_datasource(id):
    """更新数据源"""
    data = request.get_json()
    conn = get_db_connection()
    try:
        # 检查数据源是否存在
        datasource = conn.execute("SELECT * FROM datasources WHERE id = ?", (id,)).fetchone()
        if not datasource:
            return jsonify({"error": "Datasource not found"}), 404
        
        # 处理modelId，允许为null
        model_id = data.get("modelId", datasource[7])
        if model_id is not None and model_id != '':
            model_id = int(model_id)
        else:
            model_id = None
        
        # 处理domainId，必须提供
        domain_id = data.get("domainId", datasource[8])
        if domain_id is None or domain_id == '':
            return jsonify({"error": "domainId is required"}), 400
        domain_id = int(domain_id)
        
        # 更新数据源
        conn.execute(
            "UPDATE datasources SET name = ?, type = ?, url = ?, tableName = ?, status = ?, description = ?, modelId = ?, domainId = ?, updatedAt = ? WHERE id = ?",
            (data.get("name", datasource[1]), data.get("type", datasource[2]), data.get("url", datasource[3]), data.get("tableName", datasource[4]), data.get("status", datasource[5]), data.get("description", datasource[6]), model_id, domain_id, get_current_date(), id)
        )
        conn.commit()
        
        # 返回更新后的数据源
        updated_datasource = {
            "id": id,
            "name": data.get("name", datasource[1]),
            "type": data.get("type", datasource[2]),
            "url": data.get("url", datasource[3]),
            "tableName": data.get("tableName", datasource[4]),
            "status": data.get("status", datasource[5]),
            "description": data.get("description", datasource[6]),
            "modelId": model_id,
            "domainId": domain_id,
            "createdAt": datasource[9],
            "updatedAt": get_current_date()
        }
        return jsonify(updated_datasource)
    finally:
        conn.close()

@datasource_bp.route('/<int:id>', methods=['DELETE'])
def delete_datasource(id):
    """删除数据源"""
    conn = get_db_connection()
    try:
        # 删除数据源
        conn.execute("DELETE FROM datasources WHERE id = ?", (id,))
        return jsonify({"message": "Datasource deleted", "success": True})
    finally:
        conn.close()

@datasource_bp.route('/<int:id>/toggle', methods=['PUT'])
def toggle_datasource(id):
    """启用/禁用数据源"""
    conn = get_db_connection()
    try:
        # 检查数据源是否存在
        datasource = conn.execute("SELECT * FROM datasources WHERE id = ?", (id,)).fetchone()
        if not datasource:
            return jsonify({"error": "Datasource not found"}), 404
        
        # 切换状态
        new_status = "active" if datasource[5] == "inactive" else "inactive"
        conn.execute("UPDATE datasources SET status = ?, updatedAt = ? WHERE id = ?", (new_status, get_current_date(), id))
        
        # 返回更新后的数据源
        updated_datasource = {
            "id": id,
            "name": datasource[1],
            "type": datasource[2],
            "url": datasource[3],
            "tableName": datasource[4],
            "status": new_status,
            "description": datasource[6],
            "modelId": datasource[7],
            "domainId": datasource[8],
            "createdAt": datasource[9],
            "updatedAt": get_current_date()
        }
        return jsonify(updated_datasource)
    finally:
        conn.close()

@datasource_bp.route('/<int:id>/test', methods=['POST'])
def test_datasource_connection(id):
    """测试数据源连接"""
    conn = get_db_connection()
    try:
        # 检查数据源是否存在
        datasource = conn.execute("SELECT * FROM datasources WHERE id = ?", (id,)).fetchone()
        if not datasource:
            return jsonify({"error": "Datasource not found"}), 404
        
        # 测试连接
        success, message = test_database_connection(datasource[2], datasource[3])
        
        return jsonify({"success": success, "message": message})
    finally:
        conn.close()

@datasource_bp.route('/<int:id>/tables', methods=['GET'])
def get_datasource_tables(id):
    """获取数据源中的表列表"""
    conn = get_db_connection()
    try:
        # 检查数据源是否存在
        datasource = conn.execute("SELECT * FROM datasources WHERE id = ?", (id,)).fetchone()
        if not datasource:
            return jsonify({"error": "Datasource not found"}), 404
        
        # 获取表列表
        success, result = get_database_tables(datasource[2], datasource[3])
        
        if success:
            return jsonify({"success": True, "tables": result})
        else:
            return jsonify({"success": False, "message": result})
    finally:
        conn.close()
