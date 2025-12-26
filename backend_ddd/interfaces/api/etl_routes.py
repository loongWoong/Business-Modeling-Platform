"""
ETL API路由
"""
from flask import Blueprint, request, jsonify
from application.etl_service import ETLService

etl_bp = Blueprint('etl', __name__)
service = ETLService()


@etl_bp.route('/tasks', methods=['GET'])
def get_tasks():
    """获取所有ETLTask"""
    result = service.get_all()
    return jsonify(result)


@etl_bp.route('/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    """根据ID获取ETLTask"""
    result = service.get_by_id(task_id)
    if not result:
        return jsonify({"error": "ETLTask not found"}), 404
    return jsonify(result)


@etl_bp.route('/tasks', methods=['POST'])
def create_task():
    """创建ETLTask"""
    data = request.json
    try:
        result = service.create_task(data)
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400


@etl_bp.route('/tasks/<int:task_id>/activate', methods=['POST'])
def activate_task(task_id):
    """激活ETLTask"""
    result = service.activate_task(task_id)
    if not result:
        return jsonify({"error": "ETLTask not found"}), 404
    return jsonify(result)


@etl_bp.route('/tasks/<int:task_id>/pause', methods=['POST'])
def pause_task(task_id):
    """暂停ETLTask"""
    result = service.pause_task(task_id)
    if not result:
        return jsonify({"error": "ETLTask not found"}), 404
    return jsonify(result)


@etl_bp.route('/tasks/<int:task_id>/start', methods=['POST'])
def start_task(task_id):
    """启动ETLTask执行"""
    result = service.start_task(task_id)
    if not result:
        return jsonify({"error": "ETLTask not found"}), 404
    return jsonify(result)


@etl_bp.route('/tasks/<int:task_id>/complete', methods=['POST'])
def complete_task(task_id):
    """完成ETLTask执行"""
    result = service.complete_task(task_id)
    if not result:
        return jsonify({"error": "ETLTask not found"}), 404
    return jsonify(result)


@etl_bp.route('/tasks/<int:task_id>/logs', methods=['POST'])
def add_log(task_id):
    """添加ETLLog到ETLTask"""
    data = request.json
    try:
        result = service.add_log(task_id, data)
        if not result:
            return jsonify({"error": "ETLTask not found"}), 404
        return jsonify(result), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

