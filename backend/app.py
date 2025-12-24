from flask import Flask, jsonify
from flask_cors import CORS

# 创建Flask应用
app = Flask(__name__)
CORS(app)

# 导入蓝图
from routes.domain_routes import domain_bp
from routes.model_routes import model_bp
from routes.property_routes import property_bp
from routes.relation_routes import relation_bp
from routes.shared_attribute_routes import shared_attribute_bp
from routes.indicator_routes import indicator_bp
from routes.datasource_routes import datasource_bp
from routes.function_routes import function_bp
from routes.action_type_routes import action_type_bp
from routes.data_routes import data_bp
from routes.model_table_association_routes import model_table_association_bp

# 注册蓝图
app.register_blueprint(domain_bp, url_prefix='/api/domain')
app.register_blueprint(model_bp, url_prefix='/api/model')
app.register_blueprint(property_bp, url_prefix='/api/property')
app.register_blueprint(relation_bp, url_prefix='/api/relation')
app.register_blueprint(shared_attribute_bp, url_prefix='/api/shared-attribute')
app.register_blueprint(indicator_bp, url_prefix='/api/indicator')
app.register_blueprint(datasource_bp, url_prefix='/api/datasource')
app.register_blueprint(function_bp, url_prefix='/api/function')
app.register_blueprint(action_type_bp, url_prefix='/api/action-type')
app.register_blueprint(data_bp, url_prefix='/api/data')
app.register_blueprint(model_table_association_bp, url_prefix='/api/model-table-associations')

# 健康检查端点
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
