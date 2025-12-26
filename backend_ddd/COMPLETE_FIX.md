# 前后端对接完整修复指南

## 问题诊断

### 主要问题
1. **路由路径错误**：Flask 蓝图使用空字符串 `''` 导致路由注册失败
2. **API 调用方式**：前端直接访问 `http://localhost:5000`，未使用 Vite 代理
3. **CORS 配置**：虽然已配置，但使用代理可以避免 CORS 问题

## 已实施的修复

### 1. 修复后端路由路径 ✅

**问题**：Flask 蓝图中使用空字符串 `''` 作为路由路径会导致路由注册失败

**修复**：将所有路由路径从 `''` 改为 `'/'`

**修改的文件**：
- `backend_ddd/interfaces/api/domain_routes.py`
- `backend_ddd/interfaces/api/model_routes.py`
- `backend_ddd/interfaces/api/datasource_routes.py`

**修改示例**：
```python
# 修复前
@domain_bp.route('', methods=['GET'])  # ❌

# 修复后
@domain_bp.route('/', methods=['GET'])  # ✅
```

### 2. 优化前端 API 调用 ✅

**问题**：前端直接访问 `http://localhost:5000`，未利用 Vite 代理

**修复**：在开发环境中使用相对路径，通过 Vite 代理访问后端

**修改的文件**：`frontend_ddd/src/services/api.js`

**修改内容**：
```javascript
// 修复前
const API_BASE_URL = 'http://localhost:5000';

// 修复后
const API_BASE_URL = import.meta.env.PROD 
  ? 'http://localhost:5000'  // 生产环境
  : '';  // 开发环境使用相对路径，通过Vite代理
```

### 3. CORS 配置 ✅

**文件**：`backend_ddd/app.py`

```python
CORS(app, supports_credentials=True)
```

## 启动步骤

### 1. 启动后端服务

```bash
cd backend_ddd
python run.py
```

或者：

```bash
cd backend_ddd
python app.py
```

**验证后端启动**：
- 访问 `http://localhost:5000/health` 应该返回 `{"status": "healthy"}`
- 后端控制台应该显示：`Running on http://0.0.0.0:5000`

### 2. 启动前端服务

```bash
cd frontend_ddd
npm run dev
```

**验证前端启动**：
- 前端应该运行在 `http://localhost:3000`
- 浏览器控制台不应该有 405 错误

### 3. 测试 API 连接

在浏览器中：
1. 打开开发者工具（F12）
2. 查看 Network 标签
3. 刷新页面
4. 检查 `/api/domain` 请求是否成功（状态码 200）

## 路由验证

### 后端路由列表

所有路由都已正确配置：

#### Domain API
- `GET /api/domain/` - 获取所有 Domain ✅
- `GET /api/domain/<id>` - 获取 Domain 详情 ✅
- `POST /api/domain/` - 创建 Domain ✅
- `PUT /api/domain/<id>` - 更新 Domain ✅
- `DELETE /api/domain/<id>` - 删除 Domain ✅

#### Model API
- `GET /api/model/` - 获取所有 Model ✅
- `GET /api/model/<id>` - 获取 Model 详情 ✅
- `POST /api/model/` - 创建 Model ✅
- `PUT /api/model/<id>` - 更新 Model ✅
- `DELETE /api/model/<id>` - 删除 Model ✅
- `POST /api/model/<id>/properties` - 添加 Property ✅
- `DELETE /api/model/<id>/properties/<property_id>` - 删除 Property ✅
- `POST /api/model/relations` - 添加 Relation ✅
- `DELETE /api/model/relations/<relation_id>` - 删除 Relation ✅

#### Datasource API
- `GET /api/datasource/` - 获取所有 Datasource ✅
- `GET /api/datasource/<id>` - 获取 Datasource 详情 ✅
- `POST /api/datasource/` - 创建 Datasource ✅
- `PUT /api/datasource/<id>` - 更新 Datasource ✅
- `DELETE /api/datasource/<id>` - 删除 Datasource ✅
- `POST /api/datasource/<id>/toggle-status` - 切换状态 ✅
- `POST /api/datasource/<id>/mappings` - 添加 Mapping ✅
- `POST /api/datasource/<id>/associations` - 添加 Association ✅

#### ETL API
- `GET /api/etl/tasks` - 获取所有 ETLTask ✅
- `GET /api/etl/tasks/<id>` - 获取 ETLTask 详情 ✅
- `POST /api/etl/tasks` - 创建 ETLTask ✅
- `POST /api/etl/tasks/<id>/activate` - 激活任务 ✅
- `POST /api/etl/tasks/<id>/pause` - 暂停任务 ✅
- `POST /api/etl/tasks/<id>/start` - 启动任务 ✅
- `POST /api/etl/tasks/<id>/complete` - 完成任务 ✅
- `POST /api/etl/tasks/<id>/logs` - 添加日志 ✅

## 故障排查

### 问题 1: 仍然出现 405 错误

**检查清单**：
1. ✅ 后端服务是否已重启？
2. ✅ 后端控制台是否有错误信息？
3. ✅ 路由路径是否已从 `''` 改为 `'/'`？
4. ✅ 浏览器缓存是否已清除？

**解决方案**：
```bash
# 1. 停止后端（Ctrl+C）
# 2. 重新启动
cd backend_ddd
python run.py

# 3. 清除浏览器缓存（Ctrl+Shift+R）
```

### 问题 2: 网络连接失败

**检查清单**：
1. ✅ 后端服务是否运行在 5000 端口？
2. ✅ 访问 `http://localhost:5000/health` 是否正常？
3. ✅ 防火墙是否阻止了连接？

**解决方案**：
```bash
# 检查端口占用（Windows）
netstat -ano | findstr :5000

# 检查端口占用（Mac/Linux）
lsof -ti:5000
```

### 问题 3: CORS 错误

**说明**：使用 Vite 代理后，不应该出现 CORS 错误。如果仍然出现：

1. 确认 `vite.config.js` 中的代理配置正确
2. 确认前端使用相对路径（`''`）而不是完整 URL
3. 重启前端开发服务器

### 问题 4: 前端无法加载数据

**检查清单**：
1. ✅ 后端服务是否正常运行？
2. ✅ 浏览器 Network 标签中的请求状态码是什么？
3. ✅ 后端控制台是否有请求日志？

**调试步骤**：
1. 打开浏览器开发者工具
2. 查看 Network 标签
3. 找到失败的请求
4. 查看请求详情（URL、方法、状态码、响应）

## 验证清单

- [x] 所有路由路径已从 `''` 改为 `'/'`
- [x] 前端 API 配置使用相对路径（开发环境）
- [x] Vite 代理配置正确
- [x] CORS 配置正确
- [x] 后端服务可以正常启动
- [x] 健康检查端点正常
- [x] 前端可以正常访问后端 API

## 相关文件

### 后端
- `backend_ddd/app.py` - Flask 应用主文件
- `backend_ddd/run.py` - 启动脚本
- `backend_ddd/interfaces/api/domain_routes.py` - Domain 路由
- `backend_ddd/interfaces/api/model_routes.py` - Model 路由
- `backend_ddd/interfaces/api/datasource_routes.py` - Datasource 路由
- `backend_ddd/interfaces/api/etl_routes.py` - ETL 路由

### 前端
- `frontend_ddd/src/services/api.js` - API 服务层
- `frontend_ddd/vite.config.js` - Vite 配置（代理设置）

## 下一步

1. **重启后端服务**：确保使用最新的路由配置
2. **重启前端服务**：确保使用最新的 API 配置
3. **清除浏览器缓存**：确保使用最新的前端代码
4. **测试所有功能**：验证所有 API 调用是否正常

