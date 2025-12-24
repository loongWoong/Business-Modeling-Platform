from flask import Blueprint, jsonify, request
from utils import get_db_connection, get_current_date

model_table_association_bp = Blueprint('model_table_association', __name__)

@model_table_association_bp.route('', methods=['GET'])
def get_model_table_associations():
    """获取模型表关联列表"""
    model_id = request.args.get('modelId')
    conn = get_db_connection()
    try:
        if model_id and model_id.strip():
            try:
                model_id_int = int(model_id)
                # 查询指定模型的表关联
                associations = conn.execute("SELECT * FROM model_table_associations WHERE modelId = ?", (model_id_int,)).fetchall()
            except (ValueError, TypeError):
                # 如果modelId不是有效整数，返回所有关联
                associations = conn.execute("SELECT * FROM model_table_associations").fetchall()
        else:
            # 返回所有关联
            associations = conn.execute("SELECT * FROM model_table_associations").fetchall()
        
        # 转换为字典列表
        result = []
        for row in associations:
            result.append({
                "id": row[0],
                "modelId": row[1],
                "datasourceId": row[2],
                "tableName": row[3],
                "status": row[4],
                "createdAt": row[5],
                "updatedAt": row[6]
            })
        
        return jsonify(result)
    finally:
        conn.close()

@model_table_association_bp.route('', methods=['POST'])
def create_model_table_association():
    """创建模型表关联"""
    data = request.get_json()
    conn = get_db_connection()
    try:
        # 验证必填字段
        if not all(key in data for key in ['modelId', 'datasourceId', 'tableName']):
            return jsonify({"error": "modelId, datasourceId, and tableName are required"}), 400
        
        # 获取下一个ID
        next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM model_table_associations").fetchone()[0]
        
        # 处理字段类型
        model_id = int(data["modelId"])
        datasource_id = int(data["datasourceId"])
        table_name = data["tableName"]
        status = data.get("status", "active")
        
        # 插入新关联
        conn.execute(
            "INSERT INTO model_table_associations (id, modelId, datasourceId, tableName, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            (next_id, model_id, datasource_id, table_name, status, get_current_date(), get_current_date())
        )
        conn.commit()
        
        # 返回新创建的关联
        new_association = {
            "id": next_id,
            "modelId": model_id,
            "datasourceId": datasource_id,
            "tableName": table_name,
            "status": status,
            "createdAt": get_current_date(),
            "updatedAt": get_current_date()
        }
        return jsonify(new_association), 201
    finally:
        conn.close()

@model_table_association_bp.route('/<int:id>', methods=['DELETE'])
def delete_model_table_association(id):
    """删除模型表关联"""
    conn = get_db_connection()
    try:
        # 删除关联
        conn.execute("DELETE FROM model_table_associations WHERE id = ?", (id,))
        conn.commit()
        return jsonify({"message": "Model-table association deleted", "success": True})
    finally:
        conn.close()
