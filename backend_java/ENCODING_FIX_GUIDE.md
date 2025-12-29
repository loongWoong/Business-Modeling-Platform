# 中文乱码问题全面解决方案

## 问题分析

### 乱码现象
API返回的数据中，中文显示为乱码：
- "鐢ㄦ埛妯″瀷" → 应该是 "用户模型"
- "绯荤粺鐢ㄦ埛瀹氫箟" → 应该是 "系统用户定义"
- "瑙掕壊妯″瀷" → 应该是 "角色模型"
- "鏉冮檺妯″瀷" → 应该是 "权限模型"

### 根本原因
1. **数据库存储时使用了GBK编码**：Windows系统默认GBK，JVM未使用UTF-8启动时，数据以GBK存储
2. **API返回时使用UTF-8编码**：Spring配置强制使用UTF-8
3. **编码不一致导致乱码**：GBK字节被错误解释为UTF-8字符

## 解决方案

### 方案1：修复已存在的乱码数据（已实现）

系统已实现**自动编码修复机制**，在Service层自动检测并修复乱码：

1. **编码修复工具** (`EncodingFixer.java`)
   - 自动检测乱码字符串
   - 将GBK字节错误解释的字符串修复为正确的UTF-8字符串

2. **Service层自动修复**
   - `ModelServiceImpl`: 修复Model、Property、Relation的乱码
   - `DomainServiceImpl`: 修复Domain的乱码
   - 所有返回中文数据的VO转换方法都已添加编码修复

**使用方式**：无需额外操作，系统会自动修复乱码数据。

### 方案2：确保JVM使用UTF-8启动（必须）

**关键**：必须使用UTF-8编码启动JVM，确保新数据使用UTF-8存储。

#### Windows环境
```bash
# 使用启动脚本（推荐）
start.bat

# 或手动设置环境变量
set MAVEN_OPTS=-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN
set JAVA_OPTS=-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN
mvn spring-boot:run
```

#### macOS/Linux环境
```bash
# 使用启动脚本（推荐）
./start.sh

# 或手动设置环境变量
export MAVEN_OPTS="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
export JAVA_OPTS="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
mvn spring-boot:run
```

### 方案3：删除数据库重新初始化（推荐用于测试环境）

如果数据库中的数据都是测试数据，可以删除数据库文件重新初始化：

```bash
# 停止应用
# 删除数据库文件
rm backend_java/src/main/resources/app.mv.db
rm backend_java/src/main/resources/app.trace.db

# 使用启动脚本重启应用（确保JVM使用UTF-8）
start.bat  # Windows
./start.sh  # macOS/Linux
```

## 验证方法

### 1. 检查JVM编码
启动应用后，查看日志：
```
==========================================
JVM编码配置检查
==========================================
file.encoding: UTF-8  ← 应该是UTF-8，不是GBK
✅ JVM编码配置正确，使用UTF-8
==========================================
```

### 2. 测试API返回
调用API，检查返回的中文数据：
```bash
# 获取模型列表
curl http://localhost:5000/api/model

# 应该返回正确的中文，例如：
# "name": "用户模型"  ← 正确
# 而不是 "name": "鐢ㄦ埛妯″瀷"  ← 乱码
```

### 3. 测试新数据
创建新的模型或领域，检查中文是否正确：
```bash
# 创建模型
curl -X POST http://localhost:5000/api/model \
  -H "Content-Type: application/json" \
  -d '{"code":"test","name":"测试模型","description":"这是一个测试"}'

# 查询刚创建的模型，检查中文是否正确显示
```

## 已实现的修复

### 1. 编码修复工具
- **文件**: `EncodingFixer.java`
- **功能**: 
  - 自动检测乱码字符串
  - 修复GBK字节被错误解释的字符串
  - 智能修复：仅修复乱码，正常字符串直接返回

### 2. Service层修复
以下Service已添加编码修复：
- ✅ `ModelServiceImpl`: Model、Property、Relation
- ✅ `DomainServiceImpl`: Domain

### 3. 配置优化
- ✅ `pom.xml`: spring-boot-maven-plugin配置JVM参数
- ✅ `start.bat` / `start.sh`: 启动脚本设置UTF-8编码
- ✅ `application.yml`: HTTP编码配置

## 故障排查

### 问题1：API仍然返回乱码

**可能原因**：
1. JVM未使用UTF-8启动
2. 数据库中的数据已经是乱码，且修复逻辑未生效

**解决方案**：
1. 检查启动日志，确认JVM使用UTF-8
2. 如果JVM使用GBK，使用启动脚本重启应用
3. 如果数据已乱码，删除数据库文件重新初始化

### 问题2：新创建的数据仍然是乱码

**可能原因**：
- JVM未使用UTF-8启动，新数据以GBK存储

**解决方案**：
- 使用启动脚本启动应用，确保JVM使用UTF-8
- 删除乱码数据，重新创建

### 问题3：部分数据正常，部分数据乱码

**可能原因**：
- 数据是在不同编码环境下创建的

**解决方案**：
- 系统会自动修复乱码数据
- 确保后续使用UTF-8编码启动JVM

## 最佳实践

1. **始终使用启动脚本启动应用**
   ```bash
   start.bat  # Windows
   ./start.sh  # macOS/Linux
   ```

2. **开发环境统一使用UTF-8**
   - IDE设置：File encoding → UTF-8
   - 数据库：统一使用UTF-8
   - API：统一使用UTF-8

3. **定期检查编码配置**
   - 查看启动日志中的编码检查
   - 测试API返回的中文数据

## 总结

**已实现的解决方案**：
1. ✅ 自动编码修复：Service层自动检测并修复乱码
2. ✅ JVM编码配置：pom.xml和启动脚本确保UTF-8
3. ✅ HTTP编码配置：application.yml确保UTF-8

**关键要点**：
1. **必须使用UTF-8启动JVM**（通过启动脚本）
2. **系统会自动修复已存在的乱码数据**
3. **新数据会使用UTF-8存储**（JVM使用UTF-8时）

**使用方式**：
- 使用 `start.bat`（Windows）或 `start.sh`（macOS/Linux）启动应用
- 系统会自动修复乱码数据
- API返回的中文数据应该正确显示
