# 快速启动指南

## 后端DDD架构快速启动

### 1. 进入后端目录

```bash
cd backend_ddd
```

### 2. 安装依赖

```bash
pip install -r requirements.txt
```

### 3. 初始化数据库

```bash
python init_database.py
```

### 4. 测试导入（可选）

```bash
python test_imports.py
```

应该看到所有导入测试通过。

### 5. 启动应用

```bash
python run.py
```

或者：

```bash
python app.py
```

### 6. 验证

访问 http://localhost:5000/health

应该返回：
```json
{"status": "healthy"}
```

## API端点

### Model API
- `GET /api/model` - 获取所有Model
- `GET /api/model/<id>` - 获取Model详情（包含properties和relations）
- `POST /api/model` - 创建Model
- `POST /api/model/<id>/properties` - 添加Property

### Datasource API
- `GET /api/datasource` - 获取所有Datasource
- `GET /api/datasource/<id>` - 获取Datasource详情（包含mappings和associations）
- `POST /api/datasource` - 创建Datasource

### ETL API
- `GET /api/etl/tasks` - 获取所有ETLTask
- `GET /api/etl/tasks/<id>` - 获取ETLTask详情（包含logs）
- `POST /api/etl/tasks` - 创建ETLTask

### Domain API
- `GET /api/domain` - 获取所有Domain
- `POST /api/domain` - 创建Domain

## 测试示例

### 创建Domain

```bash
curl -X POST http://localhost:5000/api/domain \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"测试域\", \"description\": \"测试描述\"}"
```

### 创建Model

```bash
curl -X POST http://localhost:5000/api/model \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"用户模型\", \"code\": \"user\", \"description\": \"用户业务模型\"}"
```

### 获取所有Model

```bash
curl http://localhost:5000/api/model
```

## 项目结构

```
backend_ddd/
├── domain/              # 领域层 - 核心业务逻辑
├── application/         # 应用服务层
├── infrastructure/      # 基础设施层
├── interfaces/         # 接口层 - API
├── app.py              # Flask应用
├── run.py              # 启动脚本
├── init_database.py    # 数据库初始化
└── test_imports.py     # 导入测试
```

## 下一步

1. 查看 `backend_ddd/README.md` 了解详细架构说明
2. 查看 `backend_ddd/SETUP.md` 了解详细安装步骤
3. 查看 `DDD_REFACTORING_SUMMARY.md` 了解重构总结
4. 适配前端代码（参考 `frontend_ddd/README.md`）

