# Windows下中文乱码问题全面检查指南

## 检查链路

```
H2数据库 → JPA/Hibernate → Service层 → Controller → HTTP响应 → 前端接收 → 前端显示
```

## 1. H2数据库编码检查

### 检查点
- ✅ JVM使用UTF-8启动（关键）
- ✅ SQL脚本使用UTF-8编码读取
- ✅ 数据库会根据JVM编码自动适配

### 验证方法
查看启动日志：
```
file.encoding: UTF-8  ← 应该是UTF-8
✅ JVM编码配置正确，使用UTF-8
```

### 如果显示GBK
**解决方案**：使用启动脚本启动应用
```bash
start.bat  # Windows
./start.sh  # macOS/Linux
```

## 2. 后端Service层编码检查

### 检查点
- ✅ 数据读取时自动修复乱码（`EncodingFixer`）
- ✅ VO转换时自动修复乱码

### 已实现的修复
- `ModelServiceImpl`: 修复Model、Property、Relation
- `DomainServiceImpl`: 修复Domain

### 验证方法
查看启动日志中的编码诊断：
```
3. 数据编码检查（检查前3条模型数据）:
   模型 ID=1, code=user, name=用户模型: ✅ 编码正常
```

如果显示乱码：
```
   ⚠️  检测到乱码数据，系统会自动修复
```

## 3. 后端API响应编码检查

### 检查点
- ✅ HTTP响应头包含 `Content-Type: application/json;charset=UTF-8`
- ✅ Spring配置强制使用UTF-8

### 配置位置
1. **application.yml**:
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

2. **ResponseHeaderInterceptor**: 确保响应头包含charset

3. **ResponseBodyConfig**: 确保消息转换器使用UTF-8

### 验证方法
使用浏览器开发者工具或curl检查响应头：
```bash
curl -I http://localhost:5000/api/model

# 应该看到：
# Content-Type: application/json;charset=UTF-8
```

## 4. 前端接收编码检查

### 检查点
- ✅ API请求头包含 `Accept: application/json;charset=UTF-8`
- ✅ 使用 `TextDecoder` 确保UTF-8解析

### 配置位置
**frontend/src/services/api.js**:
```javascript
headers: {
  'Content-Type': 'application/json;charset=UTF-8',
  'Accept': 'application/json;charset=UTF-8',
}

// 使用TextDecoder确保UTF-8解析
const buffer = await response.arrayBuffer();
const decoder = new TextDecoder('UTF-8');
text = decoder.decode(buffer);
```

### 验证方法
在浏览器控制台检查：
```javascript
// 检查API响应
fetch('/api/model')
  .then(r => {
    console.log('Content-Type:', r.headers.get('content-type'));
    return r.json();
  })
  .then(data => {
    console.log('数据:', data);
    // 检查中文是否正确显示
  });
```

## 5. 前端显示编码检查

### 检查点
- ✅ HTML页面使用UTF-8编码
- ✅ React组件正确渲染中文

### 配置位置
**frontend/index.html**:
```html
<meta charset="UTF-8">
```

**frontend/vite.config.js**:
```javascript
build: {
  charset: 'utf8'
}
```

### 验证方法
在浏览器中查看页面源码：
```html
<meta charset="UTF-8">
```

## 6. 控制台输出编码（不影响功能）

### 问题
Windows控制台可能显示乱码，但这**不影响API返回的数据**。

### 原因
Windows控制台默认使用GBK编码显示UTF-8日志。

### 解决方案
**start.bat** 已设置：
```batch
chcp 65001  # 设置控制台为UTF-8
```

### 验证
如果控制台仍显示乱码，但不影响功能，可以忽略。

## 全面诊断工具

系统已实现 `EncodingDiagnostic` 工具，启动时自动检查：

```
==========================================
编码链路全面诊断
==========================================
1. JVM编码检查:
   file.encoding: UTF-8
   ✅ JVM使用UTF-8编码

2. 数据库编码检查:
   数据库类型: H2 Database
   ✅ H2数据库会根据JVM编码自动适配

3. 数据编码检查（检查前3条模型数据）:
   模型 ID=1, code=user, name=用户模型: ✅ 编码正常
   ✅ 数据编码正常
==========================================
```

## 故障排查步骤

### 步骤1：检查JVM编码
```bash
# 查看启动日志
# 应该显示：file.encoding: UTF-8
```

**如果不是UTF-8**：
- 使用 `start.bat` 启动应用
- 或设置环境变量：`set MAVEN_OPTS=-Dfile.encoding=UTF-8`

### 步骤2：检查数据库数据
```bash
# 查看启动日志中的编码诊断
# 应该显示：✅ 数据编码正常
```

**如果显示乱码**：
- 系统会自动修复（`EncodingFixer`）
- 或删除数据库文件重新初始化

### 步骤3：检查API响应
```bash
# 使用curl测试
curl http://localhost:5000/api/model

# 检查响应头
curl -I http://localhost:5000/api/model
```

**如果响应头缺少charset**：
- 检查 `ResponseHeaderInterceptor` 配置
- 检查 `application.yml` 配置

### 步骤4：检查前端接收
```javascript
// 在浏览器控制台测试
fetch('/api/model')
  .then(r => r.json())
  .then(data => console.log(data));
```

**如果前端显示乱码**：
- 检查 `api.js` 中的 `TextDecoder` 配置
- 检查浏览器控制台的网络请求响应

### 步骤5：检查前端显示
```html
<!-- 检查HTML页面 -->
<meta charset="UTF-8">
```

**如果页面显示乱码**：
- 检查 `index.html` 的charset设置
- 检查浏览器编码设置

## 常见问题

### Q1: JVM使用UTF-8，但API仍返回乱码
**A**: 检查数据库中的数据是否已经是乱码。系统会自动修复，但如果是新数据，确保JVM使用UTF-8启动。

### Q2: 后端日志显示乱码，但API返回正常
**A**: 这是控制台编码问题，不影响功能。可以忽略，或使用 `chcp 65001` 设置控制台为UTF-8。

### Q3: 前端接收的数据是乱码
**A**: 检查：
1. API响应头是否包含 `charset=UTF-8`
2. `api.js` 中的 `TextDecoder` 配置
3. 浏览器控制台的网络请求

### Q4: 部分数据正常，部分数据乱码
**A**: 说明数据是在不同编码环境下创建的。系统会自动修复乱码数据。

## 最佳实践

1. **始终使用启动脚本启动应用**
   ```bash
   start.bat  # Windows
   ./start.sh  # macOS/Linux
   ```

2. **定期检查编码诊断日志**
   - 启动时查看编码诊断输出
   - 确认所有检查点都正常

3. **测试新数据**
   - 创建包含中文的新数据
   - 验证API返回和前端显示都正常

4. **如果数据已乱码**
   - 系统会自动修复
   - 或删除数据库文件重新初始化

## 总结

**已实现的保护机制**：
1. ✅ JVM编码检查：确保使用UTF-8
2. ✅ 数据库编码适配：H2自动适配JVM编码
3. ✅ 数据编码修复：Service层自动修复乱码
4. ✅ API响应编码：Spring配置强制UTF-8
5. ✅ 前端接收编码：TextDecoder确保UTF-8解析
6. ✅ 前端显示编码：HTML charset设置

**关键要点**：
- **必须使用UTF-8启动JVM**（通过启动脚本）
- **系统会自动修复已存在的乱码数据**
- **新数据会使用UTF-8正确存储**

**验证方法**：
- 查看启动日志中的编码诊断
- 测试API返回的中文数据
- 检查前端显示的中文
