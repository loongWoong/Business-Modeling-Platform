"""
DataRecord API路由 - 使用Service层
DataRecord是Model的实例，存储在实际数据源中
"""
from flask import Blueprint, jsonify, request
from service.data_record_service import DataRecordService

data_bp = Blueprint('data', __name__)
service = DataRecordService()


@data_bp.route('', methods=['GET'])
def get_data_records():
    """获取模型数据记录"""
    model_id = request.args.get('modelId')
    limit = request.args.get('limit')
    
    if not model_id or not model_id.strip():
        return jsonify([])
    
    try:
        model_id_int = int(model_id)
        limit_int = int(limit) if limit else None
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid modelId or limit"}), 400
    
    try:
        records = service.get_all(model_id_int, limit_int)
        return jsonify([record.to_dict() for record in records])
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@data_bp.route('/<int:record_id>', methods=['GET'])
def get_data_record(record_id):
    """获取单个数据记录"""
    model_id = request.args.get('modelId')
    if not model_id:
        return jsonify({"error": "modelId is required"}), 400
    
    try:
        model_id_int = int(model_id)
        record = service.get_by_id(model_id_int, record_id)
        if not record:
            return jsonify({"error": "DataRecord not found"}), 404
        return jsonify(record.to_dict())
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid modelId"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@data_bp.route('', methods=['POST'])
def create_data_record():
    """创建数据记录"""
    data = request.get_json()
    model_id = request.args.get('modelId') or data.get('modelId')
    
    if not model_id:
        return jsonify({"error": "modelId is required"}), 400
    
    try:
        model_id_int = int(model_id)
        record = service.create(model_id_int, data)
        return jsonify(record.to_dict()), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@data_bp.route('/<int:record_id>', methods=['PUT'])
def update_data_record(record_id):
    """更新数据记录"""
    data = request.get_json()
    model_id = request.args.get('modelId') or data.get('modelId')
    
    if not model_id:
        return jsonify({"error": "modelId is required"}), 400
    
    if not data:
        return jsonify({"error": "Request body is required"}), 400
    
    try:
        model_id_int = int(model_id)
        record = service.update(model_id_int, record_id, data)
        if not record:
            return jsonify({"error": "DataRecord not found"}), 404
        return jsonify(record.to_dict())
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@data_bp.route('/<int:record_id>', methods=['DELETE'])
def delete_data_record(record_id):
    """删除数据记录"""
    model_id = request.args.get('modelId')
    
    if not model_id:
        return jsonify({"error": "modelId is required"}), 400
    
    try:
        model_id_int = int(model_id)
        success = service.delete(model_id_int, record_id)
        if not success:
            return jsonify({"error": "DataRecord not found"}), 404
        return jsonify({"message": "DataRecord deleted"})
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid modelId"}), 400
    except Exception as e:
        return jsonify({"error": str(e)}), 500