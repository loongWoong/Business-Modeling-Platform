from flask import Blueprint, jsonify, request
from utils import get_db_connection, get_current_date, test_database_connection, get_database_tables, get_database_table_schema, get_database_table_data

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
                "username": row[4],
                "password": row[5],
                "tableName": row[6],
                "status": row[7],
                "description": row[8],
                "modelId": row[9],
                "domainId": row[10],
                "createdAt": row[11],
                "updatedAt": row[12]
            })
        
        return jsonify(result)
    finally:
        conn.close()

@datasource_bp.route('/<int:id>', methods=['GET'])
def get_datasource(id):
    """获取单个数据源详情"""
    conn = get_db_connection()
    try:
        # 查询数据源
        datasource = conn.execute("SELECT * FROM datasources WHERE id = ?", (id,)).fetchone()
        
        if not datasource:
            return jsonify({"error": "Datasource not found"}), 404
        
        # 转换为字典
        result = {
            "id": datasource[0],
            "name": datasource[1],
            "type": datasource[2],
            "url": datasource[3],
            "username": datasource[4],
            "password": datasource[5],
            "tableName": datasource[6],
            "status": datasource[7],
            "description": datasource[8],
            "modelId": datasource[9],
            "domainId": datasource[10],
            "createdAt": datasource[11],
            "updatedAt": datasource[12]
        }
        
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
        
        # 插入新数据源，包含domainId、username和password字段
        conn.execute(
            "INSERT INTO datasources (id, name, type, url, username, password, tableName, status, description, modelId, domainId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (next_id, data["name"], data.get("type", "mysql"), data.get("url", ""), data.get("username", ""), data.get("password", ""), data.get("tableName", ""), data.get("status", "inactive"), data.get("description", ""), model_id, domain_id, get_current_date(), get_current_date())
        )
        
        # 返回新创建的数据源
        new_datasource = {
            "id": next_id,
            "name": data["name"],
            "type": data.get("type", "mysql"),
            "url": data.get("url", ""),
            "username": data.get("username", ""),
            "password": data.get("password", ""),
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
            "UPDATE datasources SET name = ?, type = ?, url = ?, username = ?, password = ?, tableName = ?, status = ?, description = ?, modelId = ?, domainId = ?, updatedAt = ? WHERE id = ?",
            (data.get("name", datasource[1]), data.get("type", datasource[2]), data.get("url", datasource[3]), data.get("username", datasource[4]), data.get("password", datasource[5]), data.get("tableName", datasource[6]), data.get("status", datasource[7]), data.get("description", datasource[8]), model_id, domain_id, get_current_date(), id)
        )
        conn.commit()
        
        # 返回更新后的数据源
        updated_datasource = {
            "id": id,
            "name": data.get("name", datasource[1]),
            "type": data.get("type", datasource[2]),
            "url": data.get("url", datasource[3]),
            "username": data.get("username", datasource[4]),
            "password": data.get("password", datasource[5]),
            "tableName": data.get("tableName", datasource[6]),
            "status": data.get("status", datasource[7]),
            "description": data.get("description", datasource[8]),
            "modelId": model_id,
            "domainId": domain_id,
            "createdAt": datasource[11],
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
        
        # 切换状态 - 注意：datasource[7]是status字段，而不是datasource[5]
        new_status = "active" if datasource[7] == "inactive" else "inactive"
        conn.execute("UPDATE datasources SET status = ?, updatedAt = ? WHERE id = ?", (new_status, get_current_date(), id))
        
        # 返回更新后的数据源
        updated_datasource = {
            "id": id,
            "name": datasource[1],
            "type": datasource[2],
            "url": datasource[3],
            "username": datasource[4],
            "password": datasource[5],
            "tableName": datasource[6],
            "status": new_status,
            "description": datasource[8],
            "modelId": datasource[9],
            "domainId": datasource[10],
            "createdAt": datasource[11],
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
        success, message = test_database_connection(datasource[2], datasource[3], datasource[4], datasource[5])
        
        return jsonify({"success": success, "message": message})
    finally:
        conn.close()

@datasource_bp.route('/<int:id>/tables', methods=['GET'])
def get_datasource_tables(id):
    """获取数据源的表列表"""
    conn = get_db_connection()
    try:
        # 查询数据源信息
        datasource = conn.execute("SELECT * FROM datasources WHERE id = ?", (id,)).fetchone()
        if not datasource:
            return jsonify({"error": "数据源不存在"}), 404
        
        # 调用工具函数获取表列表
        success, tables_or_error = get_database_tables(datasource[2], datasource[3], datasource[4], datasource[5])
        if success:
            return jsonify({"success": True, "tables": tables_or_error})
        else:
            return jsonify({"success": False, "message": tables_or_error})
    finally:
        conn.close()

@datasource_bp.route('/<int:id>/bind', methods=['PUT'])
def bind_datasource(id):
    """绑定数据源为全局目标数据源"""
    conn = get_db_connection()
    try:
        # 验证数据源是否存在
        datasource = conn.execute("SELECT * FROM datasources WHERE id = ?", (id,)).fetchone()
        if not datasource:
            return jsonify({"success": False, "message": "数据源不存在"}), 404
        
        # 更新全局目标数据源配置
        conn.execute(
            "UPDATE configs SET value = ?, updatedAt = ? WHERE key = ?", 
            (str(id), get_current_date(), 'global_target_datasource_id')
        )
        conn.commit()
        
        return jsonify({"success": True, "message": "数据源绑定成功"})
    except Exception as e:
        print(f"绑定数据源失败: {e}")
        conn.rollback()
        return jsonify({"success": False, "message": f"绑定数据源失败: {str(e)}"}), 500
    finally:
        conn.close()

@datasource_bp.route('/<int:id>/unbind', methods=['PUT'])
def unbind_datasource(id):
    """解绑数据源"""
    conn = get_db_connection()
    try:
        # 清除全局目标数据源配置
        conn.execute(
            "UPDATE configs SET value = NULL, updatedAt = ? WHERE key = ?", 
            (get_current_date(), 'global_target_datasource_id')
        )
        conn.commit()
        
        return jsonify({"success": True, "message": "数据源解绑成功"})
    except Exception as e:
        print(f"解绑数据源失败: {e}")
        conn.rollback()
        return jsonify({"success": False, "message": f"解绑数据源失败: {str(e)}"}), 500
    finally:
        conn.close()

@datasource_bp.route('/<int:id>/tables/<table_name>/schema', methods=['GET'])
def get_table_schema(id, table_name):
    """获取数据源表结构"""
    conn = get_db_connection()
    try:
        # 获取数据源信息
        datasource = conn.execute("SELECT type, url, username, password FROM datasources WHERE id = ?", (id,)).fetchone()
        if not datasource:
            return jsonify({"error": "Datasource not found"}), 404
        
        # 从datasource中提取信息
        datasource_type = datasource[0]
        url = datasource[1]
        username = datasource[2]
        password = datasource[3]
        
        # 使用utils函数获取真实的表结构
        success, result = get_database_table_schema(datasource_type, url, table_name, username, password)
        
        if success:
            return jsonify(result)
        else:
            return jsonify({"error": result}), 500
    finally:
        conn.close()

@datasource_bp.route('/<int:id>/tables/<table_name>/data', methods=['GET'])
def get_table_data(id, table_name):
    """获取数据源表数据"""
    conn = get_db_connection()
    try:
        # 获取数据源信息
        datasource = conn.execute("SELECT type, url, username, password FROM datasources WHERE id = ?", (id,)).fetchone()
        if not datasource:
            return jsonify({"error": "Datasource not found"}), 404
        
        # 从datasource中提取信息
        datasource_type = datasource[0]
        url = datasource[1]
        username = datasource[2]
        password = datasource[3]
        
        # 获取limit参数，默认100条
        limit = request.args.get('limit', 100, type=int)
        
        # 使用utils函数获取真实的表数据
        success, result = get_database_table_data(datasource_type, url, table_name, username, password, limit)
        
        if success:
            return jsonify({"success": True, "data": result})
        else:
            return jsonify({"success": False, "message": result}), 500
    finally:
        conn.close()

@datasource_bp.route('/<int:id>/mappings', methods=['GET'])
def get_datasource_mappings(id):
    """获取数据源的映射关系"""
    model_id = request.args.get('modelId')
    table_name = request.args.get('tableName')
    conn = get_db_connection()
    try:
        if model_id:
            # 如果提供了modelId，直接使用它查询映射关系
            model_id_int = int(model_id)
            # 查询映射关系
            mappings = conn.execute("SELECT fieldId, propertyId FROM mappings WHERE datasourceId = ? AND modelId = ?", (id, model_id_int)).fetchall()
            # 转换为字典列表
            result = []
            for row in mappings:
                result.append({
                    "fieldId": row[0],
                    "propertyId": row[1]
                })
            return jsonify(result)
        elif table_name:
            # 如果没有提供modelId，但提供了tableName，通过tableName和datasourceId获取modelId
            model_association = conn.execute(
                "SELECT modelId FROM model_table_associations WHERE datasourceId = ? AND tableName = ?",
                (id, table_name)
            ).fetchone()
            
            if not model_association:
                return jsonify([])
            
            model_id = model_association[0]
            
            # 从mappings表获取映射关系
            mappings = conn.execute(
                "SELECT m.fieldId, p.name as targetProperty FROM mappings m JOIN properties p ON m.propertyId = p.id WHERE m.datasourceId = ? AND m.modelId = ?",
                (id, model_id)
            ).fetchall()
            
            # 转换为前端需要的格式
            result = [
                {
                    "sourceField": row[0],
                    "targetProperty": row[1]
                } for row in mappings
            ]
            
            return jsonify(result)
        else:
            return jsonify({"error": "modelId or tableName is required"}), 400
    finally:
        conn.close()

@datasource_bp.route('/<int:id>/mappings', methods=['POST'])
def save_datasource_mappings(id):
    """保存数据源的映射关系"""
    data = request.get_json()
    conn = get_db_connection()
    try:
        model_id = data.get("modelId")
        mappings = data.get("mappings", [])
        
        if not model_id:
            return jsonify({"error": "modelId is required"}), 400
        
        model_id_int = int(model_id)
        
        # 删除现有映射
        conn.execute("DELETE FROM mappings WHERE datasourceId = ? AND modelId = ?", (id, model_id_int))
        
        # 插入新映射
        for mapping in mappings:
            field_id = mapping.get("fieldId")
            property_id = mapping.get("propertyId")
            
            if field_id and property_id:
                # 获取下一个ID
                next_id = conn.execute("SELECT COALESCE(MAX(id), 0) + 1 FROM mappings").fetchone()[0]
                conn.execute(
                    "INSERT INTO mappings (id, datasourceId, modelId, fieldId, propertyId, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (next_id, id, model_id_int, field_id, property_id, get_current_date(), get_current_date())
                )
        
        return jsonify({"message": "Mapping saved successfully", "success": True})
    finally:
        conn.close()

@datasource_bp.route('/config/global_target_datasource_id', methods=['GET'])
def get_global_target_datasource_id():
    """获取全局目标数据源ID"""
    conn = get_db_connection()
    try:
        result = conn.execute("SELECT value FROM configs WHERE key = ?", ('global_target_datasource_id',)).fetchone()
        if result and result[0]:
            return jsonify({"success": True, "value": result[0]})
        else:
            return jsonify({"success": True, "value": None})
    except Exception as e:
        print(f"获取全局目标数据源ID失败: {e}")
        return jsonify({"success": False, "message": str(e)}), 500
    finally:
        conn.close()



