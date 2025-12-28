#!/bin/bash

# H2 TCP 服务器启动脚本 (H2 2.x 版本)
# 用法: ./start-h2-tcp.sh [port]
# 默认端口: 9092

DB_DIR="/Users/wanglongzhen/Downloads/newmodel/jianmo-demo/backend_java/src/main/resources"
DB_NAME="app"
PORT=${1:-9092}

echo "=========================================="
echo "  H2 数据库 TCP 服务器 (H2 2.x)"
echo "=========================================="
echo "  数据库目录: $DB_DIR"
echo "  数据库名称: $DB_NAME"
echo "  端口: $PORT"
echo "=========================================="
echo ""

# 查找 H2 jar
H2_JAR=$(find ~/.m2/repository/com/h2database/h2 -name "h2-*.jar" 2>/dev/null | head -1)

if [ -z "$H2_JAR" ]; then
    echo "错误: 未找到 H2 jar 文件"
    echo "请确保已运行 mvn compile"
    exit 1
fi

echo "使用 H2 jar: $H2_JAR"
echo ""

# 确保目录存在
mkdir -p "$DB_DIR"

# 启动 H2 TCP 服务器 - H2 2.x 正确方式
echo "启动 H2 TCP 服务器..."
echo ""
echo "=========================================="
echo "  连接信息:"
echo "    JDBC URL: jdbc:h2:tcp://localhost:$PORT/$DB_NAME"
echo "    用户名: sa"
echo "    密码: (空)"
echo "=========================================="
echo ""
echo "按 Ctrl+C 停止服务器"
echo ""

# 让服务器在后台持续运行
java -cp "$H2_JAR" org.h2.tools.Server \
    -tcp \
    -tcpAllowOthers \
    -tcpPort "$PORT" \
    -ifNotExists \
    -baseDir "$DB_DIR" &

echo ""
echo "H2 TCP 服务器已停止"
