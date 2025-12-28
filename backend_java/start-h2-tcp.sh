#!/bin/bash

# H2 TCP 服务器启动脚本
# 用法: ./start-h2-tcp.sh [port]
# 默认端口: 9092

DB_PATH="/Users/wanglongzhen/Downloads/newmodel/jianmo-demo/backend_java/src/main/resources/app"
PORT=${1:-9092}

echo "=========================================="
echo "  H2 数据库 TCP 服务器"
echo "=========================================="
echo "  数据库路径: $DB_PATH"
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

# 启动 H2 TCP 服务器
echo "启动 H2 TCP 服务器..."
java -cp "$H2_JAR" org.h2.tools.Server \
    -tcp \
    -tcpAllowOthers \
    -tcpPort "$PORT" \
    -ifNotExists \
    -baseDir "$(dirname "$DB_PATH")" \
    "$(basename "$DB_PATH")"

echo ""
echo "H2 TCP 服务器已停止"
