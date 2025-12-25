from flask import Blueprint, jsonify, request
import duckdb
from utils import get_db_connection

# 创建蓝图
data_bp = Blueprint('data', __name__)

@data_bp.route('', methods=['GET'])
def get_data_records():
    """获取模型数据记录"""
    model_id = request.args.get('modelId')
    if not model_id or not model_id.strip():
        return jsonify([])
    
    try:
        model_id = int(model_id)
    except (ValueError, TypeError):
        return jsonify([])
    
    conn = get_db_connection()
    try:
        # 获取模型信息，包括模型code
        model = conn.execute("SELECT name, code FROM models WHERE id = ?", (model_id,)).fetchone()
        if not model:
            return jsonify([])
        
        model_name, model_code = model
        
        # 获取全局目标数据源ID
        global_target_config = conn.execute("SELECT value FROM configs WHERE key = ?", ('global_target_datasource_id',)).fetchone()
        if not global_target_config or not global_target_config[0]:
            # 如果没有设置全局目标数据源，返回空列表
            return jsonify([])
        
        # 获取全局目标数据源连接信息
        datasource_id = int(global_target_config[0])
        datasource = conn.execute("SELECT type, url, username, password FROM datasources WHERE id = ?", (datasource_id,)).fetchone()
        if not datasource:
            return jsonify([])
        
        datasource_type, datasource_url, username, password = datasource
        
        # 连接到外部数据源
        external_conn = None
        try:
            if datasource_type == 'duckdb':
                # 对于DuckDB，直接连接到文件
                external_conn = duckdb.connect(datasource_url)
            else:
                # 其他数据库类型需要使用对应的驱动
                # 这里简化处理，只支持DuckDB
                return jsonify([])
            
            # 根据模型code查询数据库中对应表
            # 使用模型的code作为表名，而不是模型绑定的表名
            actual_table_name = model_code
            
            # 查询表数据
            result = external_conn.execute(f"SELECT * FROM {actual_table_name}").fetchall()
            columns = [desc[0] for desc in external_conn.execute(f"DESCRIBE {actual_table_name}").fetchall()]
            
            # 将结果转换为字典列表
            data = []
            for row in result:
                data.append(dict(zip(columns, row)))
            
            return jsonify(data)
        except Exception as e:
            print(f"Error querying external datasource: {e}")
            import traceback
            traceback.print_exc()
            return jsonify([])
        finally:
            if external_conn:
                external_conn.close()
    except Exception as e:
        print(f"Error getting data records: {e}")
        import traceback
        traceback.print_exc()
        return jsonify([])
    finally:
        conn.close()
