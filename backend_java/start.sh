#!/bin/bash
# macOS/Linux启动脚本
# 设置JVM参数，确保中文正确显示
# 解决macOS/Linux环境下的中文乱码问题

# 设置Maven和JVM环境变量，确保UTF-8编码
export MAVEN_OPTS="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
export JAVA_OPTS="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
export LANG=zh_CN.UTF-8
export LC_ALL=zh_CN.UTF-8

echo "Starting application with UTF-8 encoding..."
echo ""
echo "JVM arguments set:"
echo "  -Dfile.encoding=UTF-8"
echo "  -Duser.language=zh"
echo "  -Duser.country=CN"
echo ""

# 使用Maven启动，pom.xml中已配置JVM参数
# 如果pom.xml中的配置不生效，这里会覆盖
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
