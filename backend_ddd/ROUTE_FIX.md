# 路由修复说明

## 问题分析

### 错误信息
```
GET http://localhost:5000/api/domain 405 (METHOD NOT ALLOWED)
```

### 根本原因

在 Flask 蓝图中，使用空字符串 `''` 作为路由路径会导致路由注册失败或不正确。应该使用 `'/'` 来表示蓝图的基础路径。

### 问题代码
```python
@domain_bp.route('', methods=['GET'])  # ❌ 错误
def get_domains():
    ...
```

### 正确代码
```python
@domain_bp.route('/', methods=['GET'])  # ✅ 正确
def get_domains():
    ...
```

## 已修复的路由

### 1. Domain API (`domain_routes.py`)
- ✅ `@domain_bp.route('/', methods=['GET'])` - 获取所有 Domain
- ✅ `@domain_bp.route('/', methods=['POST'])` - 创建 Domain

### 2. Model API (`model_routes.py`)
- ✅ `@model_bp.route('/', methods=['GET'])` - 获取所有 Model
- ✅ `@model_bp.route('/', methods=['POST'])` - 创建 Model

### 3. Datasource API (`datasource_routes.py`)
- ✅ `@datasource_bp.route('/', methods=['GET'])` - 获取所有 Datasource
- ✅ `@datasource_bp.route('/', methods=['POST'])` - 创建 Datasource

## 验证步骤

### 1. 重启后端服务

**重要：必须重启后端服务才能使更改生效！**

```bash
# 停止当前服务（Ctrl+C）
# 然后重新启动
cd backend_ddd
python app.py
```

### 2. 验证路由注册

后端启动后，应该能看到类似以下的输出：
```
 * Running on http://0.0.0.0:5000
```

### 3. 测试 API

在浏览器中访问：
- `http://localhost:5000/health` - 应该返回 `{"status": "healthy"}`
- `http://localhost:5000/api/domain` - 应该返回 Domain 列表（可能是空数组）

或者运行测试脚本：
```bash
python backend_ddd/test_api.py
```

### 4. 清除浏览器缓存

1. 打开浏览器开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

或使用快捷键：
- Windows: `Ctrl+Shift+R`
- Mac: `Cmd+Shift+R`

## 技术说明

### Flask 蓝图路由路径规则

在 Flask 中，当使用蓝图时：

1. **空字符串 `''`** - 可能导致路由注册问题，不推荐使用
2. **斜杠 `'/'`** - 表示蓝图的基础路径，推荐使用
3. **带前缀的路径** - 如 `'/<int:id>'` 用于参数化路由

### 路由组合

当蓝图注册时：
```python
app.register_blueprint(domain_bp, url_prefix='/api/domain')
```

路由定义：
```python
@domain_bp.route('/', methods=['GET'])
```

最终的路由路径是：`/api/domain/` 或 `/api/domain`（Flask 会自动处理尾部斜杠）

## 相关文件

- `backend_ddd/interfaces/api/domain_routes.py`
- `backend_ddd/interfaces/api/model_routes.py`
- `backend_ddd/interfaces/api/datasource_routes.py`
- `backend_ddd/app.py`

## 注意事项

1. **必须重启后端服务**：修改路由后必须重启 Flask 应用
2. **清除浏览器缓存**：确保浏览器使用最新的 API 调用
3. **检查后端日志**：查看是否有路由注册错误

