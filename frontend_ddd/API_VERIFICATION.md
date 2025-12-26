# 前后端接口验证文档

本文档验证前端 API 调用与后端路由的匹配情况。

## ✅ 已验证的接口

### 1. Domain API

| 前端调用 | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `GET /api/domain` | `GET /api/domain` | GET | ✅ 匹配 |
| `GET /api/domain/:id` | `GET /api/domain/<int:domain_id>` | GET | ✅ 匹配 |
| `POST /api/domain` | `POST /api/domain` | POST | ✅ 匹配 |
| `PUT /api/domain/:id` | `PUT /api/domain/<int:domain_id>` | PUT | ✅ 匹配 |
| `DELETE /api/domain/:id` | `DELETE /api/domain/<int:domain_id>` | DELETE | ✅ 匹配 |

**后端返回结构：**
- `get_all()`: `List[Dict]` - 直接返回 Domain 列表
- `get_by_id()`: `Dict` - 返回单个 Domain 对象
- `create_domain()`: `Dict` - 返回创建的 Domain 对象
- `update_domain()`: `Dict` - 返回更新的 Domain 对象
- `delete_domain()`: `bool` - 返回删除结果

### 2. Model API

| 前端调用 | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `GET /api/model?domainId=xxx` | `GET /api/model?domainId=xxx` | GET | ✅ 匹配 |
| `GET /api/model/:id` | `GET /api/model/<int:model_id>` | GET | ✅ 匹配 |
| `POST /api/model` | `POST /api/model` | POST | ✅ 匹配 |
| `PUT /api/model/:id` | `PUT /api/model/<int:model_id>` | PUT | ✅ 匹配 |
| `DELETE /api/model/:id` | `DELETE /api/model/<int:model_id>` | DELETE | ✅ 匹配 |
| `POST /api/model/:id/properties` | `POST /api/model/<int:model_id>/properties` | POST | ✅ 匹配 |
| `DELETE /api/model/:id/properties/:propertyId` | `DELETE /api/model/<int:model_id>/properties/<int:property_id>` | DELETE | ✅ 匹配 |
| `POST /api/model/relations` | `POST /api/model/relations` | POST | ✅ 匹配 |
| `DELETE /api/model/relations/:relationId` | `DELETE /api/model/relations/<int:relation_id>` | DELETE | ✅ 匹配 |

**后端返回结构：**
- `get_all(domain_id)`: `{models: [], edges: []}` - 返回模型列表和关系边
- `get_by_id(id)`: `{model: {}, properties: [], relations: []}` - 返回模型详情
- `create_model()`: `Dict` - 返回创建的 Model 对象
- `update_model()`: `Dict` - 返回更新的 Model 对象
- `add_property()`: `Dict` - 返回创建的 Property 对象
- `add_relation()`: `Dict` - 返回创建的 Relation 对象

### 3. Datasource API

| 前端调用 | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `GET /api/datasource?domainId=xxx` | `GET /api/datasource?domainId=xxx` | GET | ✅ 匹配 |
| `GET /api/datasource/:id` | `GET /api/datasource/<int:datasource_id>` | GET | ✅ 匹配 |
| `POST /api/datasource` | `POST /api/datasource` | POST | ✅ 匹配 |
| `PUT /api/datasource/:id` | `PUT /api/datasource/<int:datasource_id>` | PUT | ✅ 匹配 |
| `DELETE /api/datasource/:id` | `DELETE /api/datasource/<int:datasource_id>` | DELETE | ✅ 匹配 |
| `POST /api/datasource/:id/toggle-status` | `POST /api/datasource/<int:datasource_id>/toggle-status` | POST | ✅ 匹配 |
| `POST /api/datasource/:id/mappings` | `POST /api/datasource/<int:datasource_id>/mappings` | POST | ✅ 匹配 |
| `POST /api/datasource/:id/associations` | `POST /api/datasource/<int:datasource_id>/associations` | POST | ✅ 匹配 |

**后端返回结构：**
- `get_all(domain_id)`: `List[Dict]` - 返回 Datasource 列表
- `get_by_id(id)`: `{datasource: {}, mappings: [], associations: []}` - 返回 Datasource 详情
- `create_datasource()`: `Dict` - 返回创建的 Datasource 对象
- `update_datasource()`: `Dict` - 返回更新的 Datasource 对象
- `toggle_status()`: `Dict` - 返回更新后的 Datasource 对象

### 4. ETL API

| 前端调用 | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `GET /api/etl/tasks` | `GET /api/etl/tasks` | GET | ✅ 匹配 |
| `GET /api/etl/tasks/:id` | `GET /api/etl/tasks/<int:task_id>` | GET | ✅ 匹配 |
| `POST /api/etl/tasks` | `POST /api/etl/tasks` | POST | ✅ 匹配 |
| `POST /api/etl/tasks/:id/activate` | `POST /api/etl/tasks/<int:task_id>/activate` | POST | ✅ 匹配 |
| `POST /api/etl/tasks/:id/pause` | `POST /api/etl/tasks/<int:task_id>/pause` | POST | ✅ 匹配 |
| `POST /api/etl/tasks/:id/start` | `POST /api/etl/tasks/<int:task_id>/start` | POST | ✅ 匹配 |
| `POST /api/etl/tasks/:id/complete` | `POST /api/etl/tasks/<int:task_id>/complete` | POST | ✅ 匹配 |
| `POST /api/etl/tasks/:id/logs` | `POST /api/etl/tasks/<int:task_id>/logs` | POST | ✅ 匹配 |

**后端返回结构：**
- `get_all()`: `List[Dict]` - 返回 ETLTask 列表
- `get_by_id(id)`: `{task: {}, logs: []}` - 返回 ETLTask 详情
- `create_task()`: `Dict` - 返回创建的 ETLTask 对象
- `activate_task()`: `Dict` - 返回更新后的 ETLTask 对象
- `pause_task()`: `Dict` - 返回更新后的 ETLTask 对象
- `start_task()`: `Dict` - 返回更新后的 ETLTask 对象

### 5. Health Check API

| 前端调用 | 后端路由 | 方法 | 状态 |
|---------|---------|------|------|
| `GET /health` | `GET /health` | GET | ✅ 匹配 |

## 🔧 已修复的问题

1. ✅ **修复了 `datasourceAPI.update` 的重复定义**
   - 删除了重复的 `update` 方法定义

2. ✅ **改进了 API 错误处理**
   - 添加了空响应处理（204 No Content）
   - 改进了错误消息提取
   - 添加了网络错误检测

3. ✅ **验证了所有接口路径匹配**
   - 所有前端调用的接口路径都与后端路由匹配

## 📝 数据格式说明

### 前端期望的数据格式

1. **Model.getAll()**: 
   - 前端期望: `{models: [], edges: []}` 或直接数组
   - 后端返回: `{models: [], edges: []}` ✅

2. **Model.getById()**: 
   - 前端期望: `{model: {}, properties: [], relations: []}`
   - 后端返回: `{model: {}, properties: [], relations: []}` ✅

3. **Datasource.getById()**: 
   - 前端期望: `{datasource: {}, mappings: [], associations: []}`
   - 后端返回: `{datasource: {}, mappings: [], associations: []}` ✅

4. **ETL.getTaskById()**: 
   - 前端期望: `{task: {}, logs: []}`
   - 后端返回: `{task: {}, logs: []}` ✅

## ⚠️ 注意事项

1. **错误响应格式**: 后端返回错误时使用 `{"error": "message"}` 格式，前端已正确处理

2. **空响应**: DELETE 操作可能返回 200 状态码但无响应体，已添加处理

3. **网络错误**: 前端已添加网络连接失败的友好提示

4. **CORS**: 后端已配置 CORS，允许前端跨域请求

## 🧪 测试建议

1. 测试所有 CRUD 操作
2. 测试错误情况（404, 400, 500）
3. 测试网络断开情况
4. 验证数据格式是否正确解析

