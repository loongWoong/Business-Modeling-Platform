# 中文乱码问题解决方案

本文档说明如何解决Windows和macOS环境下的中文乱码问题。

## 已实施的解决方案

### 1. 配置文件修改

#### application.yml
- ✅ 添加了 `server.servlet.encoding` 配置
- ✅ 添加了 `spring.http.encoding` 配置
- ✅ 数据库连接URL已配置（H2默认支持UTF-8）

#### pom.xml
- ✅ 添加了项目编码配置：`project.build.sourceEncoding=UTF-8`
- ✅ 添加了Maven编译器编码配置：`maven.compiler.encoding=UTF-8`

### 2. Java配置类

#### CharsetConfig.java
- ✅ 创建了字符编码过滤器，强制所有HTTP请求和响应使用UTF-8

### 3. 启动脚本

#### Windows (start.bat)
```batch
chcp 65001
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dfile.encoding=UTF-8"
```

#### macOS/Linux (start.sh)
```bash
export LANG=zh_CN.UTF-8
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dfile.encoding=UTF-8"
```

## 使用方法

### Windows环境
1. 使用提供的启动脚本：
   ```cmd
   start.bat
   ```

2. 或者手动设置环境变量后启动：
   ```cmd
   set JAVA_OPTS=-Dfile.encoding=UTF-8
   mvn spring-boot:run
   ```

### macOS/Linux环境
1. 使用提供的启动脚本：
   ```bash
   chmod +x start.sh
   ./start.sh
   ```

2. 或者手动设置环境变量后启动：
   ```bash
   export LANG=zh_CN.UTF-8
   export JAVA_OPTS=-Dfile.encoding=UTF-8
   mvn spring-boot:run
   ```

## 验证编码配置

启动应用后，可以通过以下方式验证：

1. **检查日志输出**：控制台应该能正确显示中文
2. **测试API**：创建包含中文的Domain或Model，检查是否能正确保存和读取
3. **检查数据库**：使用H2控制台查看数据，中文应该正确显示

## 常见问题

### Q: Windows控制台仍然显示乱码？
A: 确保使用 `chcp 65001` 设置控制台代码页为UTF-8，或使用PowerShell/新的Windows Terminal。

### Q: 数据库中的中文显示为问号？
A: H2数据库默认使用UTF-8，如果仍有问题，检查：
- 数据库连接URL是否正确
- 应用启动时JVM参数是否包含 `-Dfile.encoding=UTF-8`

### Q: API返回的中文是乱码？
A: 检查：
- `CharsetConfig` 是否生效
- HTTP响应头是否包含 `Content-Type: application/json;charset=UTF-8`
- 前端是否正确处理UTF-8编码

## 技术细节

### 编码配置层级
1. **JVM级别**：`-Dfile.encoding=UTF-8`
2. **Spring Boot级别**：`spring.http.encoding.charset=UTF-8`
3. **Servlet级别**：`server.servlet.encoding.charset=UTF-8`
4. **Filter级别**：`CharacterEncodingFilter` 强制UTF-8

### H2数据库编码
H2数据库默认使用UTF-8编码，无需额外配置。如果使用文件数据库，确保文件系统支持UTF-8。

## 兼容性说明

- ✅ Windows 10/11
- ✅ macOS (所有版本)
- ✅ Linux (Ubuntu, CentOS等)
- ✅ Java 8+
