# 测试指南

## 测试类型

### 1. 导入测试

测试所有模块是否能正常导入：

```bash
python test_imports.py
```

**预期结果**：所有导入测试通过

### 2. 基础功能测试

测试领域模型、仓储和服务层（不依赖HTTP服务器）：

```bash
python test_basic.py
```

**测试内容**：
- 领域模型创建和验证
- 业务规则验证
- 仓储操作
- 应用服务操作

**预期结果**：所有测试通过

### 3. API测试

测试HTTP API端点（需要服务器运行）：

#### 步骤1：启动服务器

在一个终端窗口：

```bash
python run.py
```

#### 步骤2：运行API测试

在另一个终端窗口：

```bash
python test_api.py
```

**测试内容**：
- 健康检查端点
- Domain API（创建、查询）
- Model API（创建、查询、添加Property）
- Datasource API（创建、查询）
- ETL API（查询）

**预期结果**：所有API测试通过

## 手动测试

### 使用curl测试

#### 1. 健康检查

```bash
curl http://localhost:5000/health
```

#### 2. 创建Domain

```bash
curl -X POST http://localhost:5000/api/domain \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"测试域\", \"description\": \"测试描述\"}"
```

#### 3. 创建Model

```bash
curl -X POST http://localhost:5000/api/model \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"用户模型\", \"code\": \"user\", \"description\": \"用户业务模型\"}"
```

#### 4. 获取所有Model

```bash
curl http://localhost:5000/api/model
```

#### 5. 获取Model详情（包含properties和relations）

```bash
curl http://localhost:5000/api/model/1
```

#### 6. 添加Property到Model

```bash
curl -X POST http://localhost:5000/api/model/1/properties \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"用户名\", \"code\": \"username\", \"type\": \"string\", \"required\": true}"
```

### 使用Postman或类似工具

1. 导入API集合（可以手动创建）
2. 设置base URL为 `http://localhost:5000`
3. 测试各个端点

## 测试覆盖

### 已测试功能

✅ 领域模型创建和验证
✅ 业务规则验证
✅ 仓储基本操作
✅ 应用服务基本操作
✅ API端点响应

### 待测试功能

- [ ] 完整的CRUD操作
- [ ] 错误处理
- [ ] 边界情况
- [ ] 并发操作
- [ ] 性能测试

## 故障排除

### 问题1：导入错误

**症状**：`ModuleNotFoundError`

**解决方案**：
- 确保在 `backend_ddd` 目录下运行
- 检查Python路径设置
- 运行 `python test_imports.py` 诊断

### 问题2：数据库连接错误

**症状**：`duckdb.OperationalError`

**解决方案**：
- 运行 `python init_database.py` 初始化数据库
- 检查 `app.data.db` 文件是否存在

### 问题3：服务器无法启动

**症状**：端口被占用或启动失败

**解决方案**：
- 检查5000端口是否被占用
- 修改 `app.py` 或 `run.py` 中的端口号
- 检查依赖是否安装：`pip install -r requirements.txt`

### 问题4：API测试失败

**症状**：`ConnectionError` 或 `Timeout`

**解决方案**：
- 确保服务器正在运行
- 检查服务器地址和端口
- 等待服务器完全启动后再运行测试

## 持续集成

可以集成到CI/CD流程：

```yaml
# 示例 GitHub Actions
- name: Run tests
  run: |
    cd backend_ddd
    pip install -r requirements.txt
    python init_database.py
    python test_imports.py
    python test_basic.py
    python run.py &
    sleep 5
    python test_api.py
```

## 性能测试

未来可以添加性能测试：

- 负载测试（使用locust或类似工具）
- 压力测试
- 响应时间测试

## 测试最佳实践

1. **先运行基础测试**：确保核心功能正常
2. **再运行API测试**：确保接口正常
3. **定期运行测试**：在代码修改后
4. **保持测试更新**：添加新功能时添加相应测试

