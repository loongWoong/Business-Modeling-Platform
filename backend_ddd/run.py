"""
启动脚本
用于启动Flask应用
"""
import sys
import os

# 添加当前目录到Python路径
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# 导入并运行应用
from app import app

if __name__ == '__main__':
    print("=" * 50)
    print("基于DDD架构的业务建模平台")
    print("=" * 50)
    print(f"应用启动在: http://localhost:5000")
    print(f"健康检查: http://localhost:5000/health")
    print("=" * 50)
    app.run(debug=True, host='0.0.0.0', port=5000)

