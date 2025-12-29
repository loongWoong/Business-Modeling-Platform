@echo off
REM Windows启动脚本
REM 设置JVM参数，确保中文正确显示
REM 解决Windows环境下的中文乱码问题

REM 设置控制台代码页为UTF-8
chcp 65001 >nul 2>&1

REM 设置Maven和JVM环境变量，确保UTF-8编码
set MAVEN_OPTS=-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN
set JAVA_OPTS=-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN

echo Starting application with UTF-8 encoding...
echo 正在使用UTF-8编码启动应用...
echo.
echo JVM参数已设置:
echo   -Dfile.encoding=UTF-8
echo   -Duser.language=zh
echo   -Duser.country=CN
echo.

REM 使用Maven启动，pom.xml中已配置JVM参数
REM 如果pom.xml中的配置不生效，这里会覆盖
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
