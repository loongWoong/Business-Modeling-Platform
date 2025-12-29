# Windows下中文乱码问题解决方案

## 问题现象

应用启动时显示：
```
file.encoding: GBK
⚠️  警告：JVM未使用UTF-8编码！
```

这会导致：
- 数据库中的中文数据乱码
- API返回的中文数据乱码
- 前端显示的中文乱码

## 根本原因

Windows系统默认使用GBK编码，如果JVM启动时没有指定UTF-8编码，会使用系统默认的GBK编码，导致：
1. 数据库存储时使用GBK编码
2. API返回时使用UTF-8编码
3. 编码不一致导致乱码

## 解决方案

### 方案1：使用启动脚本（推荐）

**Windows环境**：
```bash
start.bat
```

**macOS/Linux环境**：
```bash
./start.sh
```

启动脚本会自动：
1. 设置控制台为UTF-8编码（Windows）
2. 设置JVM参数 `-Dfile.encoding=UTF-8`
3. 确保整个应用使用UTF-8编码

### 方案2：手动设置环境变量

**Windows PowerShell**：
```powershell
$env:MAVEN_OPTS="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
$env:JAVA_OPTS="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
mvn spring-boot:run
```

**Windows CMD**：
```cmd
set MAVEN_OPTS=-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN
set JAVA_OPTS=-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN
mvn spring-boot:run
```

**macOS/Linux**：
```bash
export MAVEN_OPTS="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
export JAVA_OPTS="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
mvn spring-boot:run
```

### 方案3：在IDE中设置

**IntelliJ IDEA**：
1. Run -> Edit Configurations
2. 选择你的Application配置
3. 在VM options中添加：`-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN`
4. 应用并运行

**Eclipse**：
1. Run -> Run Configurations
2. 选择你的Java Application配置
3. 在Arguments标签页的VM arguments中添加：`-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN`
4. 应用并运行

**VS Code**：
在 `.vscode/launch.json` 中添加：
```json
{
    "configurations": [
        {
            "type": "java",
            "request": "launch",
            "mainClass": "com.jianmo.platform.PlatformApplication",
            "vmArgs": "-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
        }
    ]
}
```

## 验证方法

启动应用后，查看日志，应该看到：
```
==========================================
JVM编码配置检查
==========================================
file.encoding: UTF-8
user.language: zh
user.country: CN
defaultCharset: UTF-8
==========================================
✅ JVM编码配置正确，使用UTF-8
   数据库和API将统一使用UTF-8编码，确保中文正确显示
==========================================
```

如果看到 `file.encoding: GBK`，说明JVM参数没有生效，需要检查：
1. 是否使用了启动脚本
2. 环境变量是否正确设置
3. IDE配置是否正确

## 如果数据库已有乱码数据

如果数据库中已经有乱码数据，需要删除数据库文件重新初始化：

```bash
# 停止应用
# 删除数据库文件
rm backend_java/src/main/resources/app.mv.db
rm backend_java/src/main/resources/app.trace.db

# 重启应用，系统会重新执行schema.sql
# 使用启动脚本启动
start.bat  # Windows
./start.sh  # macOS/Linux
```

## 配置说明

### pom.xml配置

已在 `pom.xml` 的 `spring-boot-maven-plugin` 中配置：
```xml
<configuration>
    <jvmArguments>-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN</jvmArguments>
</configuration>
```

这确保使用 `mvn spring-boot:run` 启动时，JVM会自动使用UTF-8编码。

### application.yml配置

已在 `application.yml` 中配置：
```yaml
server:
  servlet:
    encoding:
      charset: UTF-8
      enabled: true
      force: true

spring:
  http:
    encoding:
      charset: UTF-8
      enabled: true
      force: true
```

这确保HTTP请求和响应都使用UTF-8编码。

## 总结

**关键要点**：
1. **必须使用UTF-8编码启动JVM**（通过启动脚本或环境变量）
2. **数据库统一使用UTF-8编码**（JVM使用UTF-8时，H2会自动使用UTF-8）
3. **API响应统一使用UTF-8编码**（通过Spring配置）
4. **如果数据已乱码，删除数据库文件重新初始化**

**最简单的解决方案**：使用 `start.bat`（Windows）或 `start.sh`（macOS/Linux）启动应用。
