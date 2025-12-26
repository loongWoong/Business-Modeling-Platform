# 前端错误修复指南

## 问题：405 METHOD NOT ALLOWED 错误

### 原因分析

405 错误通常由以下原因引起：
1. **CORS 预检请求失败**：浏览器在发送跨域请求前会先发送 OPTIONS 预检请求
2. **路由配置问题**：后端路由没有正确处理 OPTIONS 方法
3. **HTTP 方法不匹配**：请求的方法与路由定义的方法不一致

### 已实施的修复

#### 1. 改进后端 CORS 配置

**文件**: `backend_ddd/app.py`

```python
CORS(app, resources={
    r"/api/*": {
        "origins": "*",
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    },
    r"/health": {
        "origins": "*",
        "methods": ["GET", "OPTIONS"]
    }
})
```

#### 2. 为路由添加 OPTIONS 方法支持

为所有主要的 GET 路由添加了 OPTIONS 方法处理：

- `backend_ddd/interfaces/api/domain_routes.py`
- `backend_ddd/interfaces/api/model_routes.py`
- `backend_ddd/interfaces/api/datasource_routes.py`
- `backend_ddd/interfaces/api/etl_routes.py`

示例：
```python
@domain_bp.route('', methods=['GET', 'OPTIONS'])
def get_domains():
    """获取所有Domain"""
    if request.method == 'OPTIONS':
        return '', 200
    result = service.get_all()
    return jsonify(result)
```

#### 3. 改进前端错误处理

**文件**: `frontend_ddd/src/services/api.js`

- 添加了更详细的错误信息
- 针对 405 错误提供友好提示
- 改进了网络错误检测

**文件**: `frontend_ddd/src/pages/HomePage/HomePage.jsx`

- 使用 `Promise.allSettled` 替代 `Promise.all`，确保部分请求失败不影响其他请求
- 改进了错误处理逻辑

### 测试步骤

1. **确保后端服务运行**
   ```bash
   cd backend_ddd
   python app.py
   ```

2. **测试后端 API**
   ```bash
   cd backend_ddd
   python test_api.py
   ```

3. **检查前端控制台**
   - 打开浏览器开发者工具
   - 查看 Network 标签页
   - 检查是否有 OPTIONS 预检请求
   - 检查请求是否成功

### 常见问题排查

#### 问题 1: 仍然出现 405 错误

**解决方案**:
1. 检查后端服务是否正在运行
2. 检查后端端口是否为 5000
3. 检查前端 API_BASE_URL 是否正确
4. 清除浏览器缓存并刷新

#### 问题 2: CORS 错误

**解决方案**:
1. 确认后端 CORS 配置正确
2. 检查浏览器控制台的完整错误信息
3. 尝试使用不同的浏览器

#### 问题 3: 网络连接失败

**解决方案**:
1. 检查后端服务是否运行：访问 `http://localhost:5000/health`
2. 检查防火墙设置
3. 确认端口 5000 未被其他程序占用

### 验证清单

- [x] 后端 CORS 配置正确
- [x] 所有路由支持 OPTIONS 方法
- [x] 前端错误处理完善
- [x] API 请求使用正确的 HTTP 方法
- [x] 错误信息友好且有用

### 下一步

如果问题仍然存在：

1. **检查后端日志**
   - 查看后端控制台输出
   - 检查是否有路由注册错误

2. **使用测试脚本**
   ```bash
   python backend_ddd/test_api.py
   ```

3. **检查浏览器网络请求**
   - 打开开发者工具
   - 查看 Network 标签
   - 检查请求和响应详情

4. **验证路由注册**
   - 确认所有蓝图都已正确注册
   - 检查 URL 前缀是否正确

### 相关文件

- `backend_ddd/app.py` - Flask 应用和 CORS 配置
- `backend_ddd/interfaces/api/*_routes.py` - API 路由定义
- `frontend_ddd/src/services/api.js` - 前端 API 服务层
- `frontend_ddd/src/pages/HomePage/HomePage.jsx` - 首页组件
- `backend_ddd/test_api.py` - API 测试脚本

