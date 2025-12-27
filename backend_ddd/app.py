"""
Flask应用主文件
基于DDD架构的业务建模平台
"""
import sys
import os

# 添加当前目录到Python路径
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from flask import Flask, jsonify
from flask_cors import CORS

# 创建Flask应用
app = Flask(__name__)
# 配置CORS，允许所有来源和所有方法（最简单的配置）
CORS(app, supports_credentials=True)

# 导入API路由
from interfaces.api.model_routes import model_bp
from interfaces.api.datasource_routes import datasource_bp
from interfaces.api.etl_routes import etl_bp
from interfaces.api.domain_routes import domain_bp

# 注册蓝图
app.register_blueprint(model_bp, url_prefix='/api/model')
app.register_blueprint(datasource_bp, url_prefix='/api/datasource')
app.register_blueprint(etl_bp, url_prefix='/api/etl')
app.register_blueprint(domain_bp, url_prefix='/api/domain')

# 健康检查端点
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5001)

