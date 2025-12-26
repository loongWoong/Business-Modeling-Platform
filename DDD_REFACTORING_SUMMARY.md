# DDD重构总结

## 项目概述

本次重构基于领域驱动设计（DDD）原则，将原有的直接数据库操作模式重构为以领域模型为核心的架构。

## 重构目标

1. **领域模型为核心**：将业务逻辑封装在领域模型中，而非直接操作数据库
2. **聚合根管理**：通过聚合根管理聚合内的实体
3. **清晰的层次结构**：领域层、应用层、基础设施层、接口层分离
4. **业务规则验证**：在领域模型中验证业务规则

## 新架构结构

### 后端架构（backend_ddd/）

```
backend_ddd/
├── domain/                    # 领域层 - 核心业务逻辑
│   ├── model/                # Model聚合
│   │   ├── model.py          # Model聚合根
│   │   ├── property.py       # Property实体
│   │   └── relation.py       # Relation实体
│   ├── datasource/            # Datasource聚合
│   │   ├── datasource.py     # Datasource聚合根
│   │   ├── mapping.py         # Mapping实体
│   │   └── model_table_association.py
│   ├── etl/                   # ETL聚合
│   │   ├── etl_task.py        # ETLTask聚合根
│   │   └── etl_log.py         # ETLLog实体
│   └── shared/                # 共享领域模型
│       └── domain.py          # Domain实体
├── application/               # 应用服务层 - 协调业务用例
│   ├── model_service.py
│   ├── datasource_service.py
│   ├── etl_service.py
│   └── domain_service.py
├── infrastructure/            # 基础设施层 - 技术实现
│   ├── repository/            # 仓储实现
│   └── persistence/           # 持久化
├── interfaces/                # 接口层 - API端点
│   └── api/
├── app.py                     # Flask应用
└── init_database.py           # 数据库初始化
```

### 前端架构（frontend_ddd/）

前端代码需要适配新的API结构，详见 `frontend_ddd/README.md`。

## 领域模型设计

### 聚合结构

#### 1. Model聚合
- **聚合根**: `Model`
- **实体**: `Property`, `Relation`
- **业务规则**:
  - Property必须属于某个Model
  - Property的code在Model内必须唯一
  - Relation连接两个Model

#### 2. Datasource聚合
- **聚合根**: `Datasource`
- **实体**: `Mapping`, `ModelTableAssociation`
- **业务规则**:
  - Mapping连接Datasource、Model和Property
  - ModelTableAssociation连接Model和Datasource的表

#### 3. ETL聚合
- **聚合根**: `ETLTask`
- **实体**: `ETLLog`
- **业务规则**:
  - ETLLog必须属于某个ETLTask
  - ETLTask有状态管理（inactive, active, running, paused, error）

#### 4. Domain（分类维度）
- Domain不是聚合根，作为可选的分类标签
- Models和Datasources可以关联到Domain

## 核心改进

### 1. 领域模型包含业务逻辑

**旧版本**：
```python
# 实体只是数据容器
class Model:
    def __init__(self, id, name, code, ...):
        self.id = id
        self.name = name
        # 没有业务逻辑
```

**新版本**：
```python
# 实体包含业务逻辑
class Model:
    def add_property(self, property: Property) -> None:
        # 业务规则验证
        if property.modelId != self.id:
            raise ValueError("Property must belong to Model")
        if any(p.code == property.code for p in self._properties):
            raise ValueError("Property code must be unique")
        # 业务操作
        self._properties.append(property)
```

### 2. 仓储通过聚合根操作

**旧版本**：
```python
# 直接操作数据库表
def create_property(property_data):
    conn.execute("INSERT INTO properties ...")
```

**新版本**：
```python
# 通过聚合根操作
def add_property(model_id, property_data):
    model = repository.find_by_id(model_id)  # 加载聚合
    property = Property.from_dict(property_data)
    model.add_property(property)  # 通过聚合根添加
    repository.save(model)  # 保存聚合（自动保存Property）
```

### 3. 应用服务协调业务用例

**旧版本**：
```python
# Service直接操作Repository和数据库
class ModelService:
    def create(self, data):
        # 直接插入数据库
        conn.execute("INSERT INTO models ...")
```

**新版本**：
```python
# Service协调领域模型
class ModelService:
    def create_model(self, data):
        model = Model.from_dict(data)  # 创建领域对象
        model = self.repository.save(model)  # 通过仓储保存
        return model.to_dict()
```

## API变化

### Model API

- `GET /api/model/<id>` 现在返回 `{model: {}, properties: [], relations: []}`
- `POST /api/model/<id>/properties` 通过聚合根添加Property
- `POST /api/model/relations` 添加Relation

### Datasource API

- `GET /api/datasource/<id>` 现在返回 `{datasource: {}, mappings: [], associations: []}`
- `POST /api/datasource/<id>/mappings` 通过聚合根添加Mapping
- `POST /api/datasource/<id>/toggle-status` 切换状态

### ETL API

- `GET /api/etl/tasks/<id>` 现在返回 `{task: {}, logs: []}`
- `POST /api/etl/tasks/<id>/activate` 激活任务
- `POST /api/etl/tasks/<id>/pause` 暂停任务

## 使用示例

### 创建Model并添加Property

```python
from application.model_service import ModelService

service = ModelService()

# 创建Model
model = service.create_model({
    "name": "用户模型",
    "code": "user",
    "description": "用户业务模型"
})

# 添加Property（通过聚合根）
property = service.add_property(model["id"], {
    "name": "用户名",
    "code": "username",
    "type": "string",
    "required": True
})
```

### 创建Datasource并定义ETL任务

```python
from application.datasource_service import DatasourceService
from application.etl_service import ETLService

ds_service = DatasourceService()
etl_service = ETLService()

# 创建Datasource
datasource = ds_service.create_datasource({
    "name": "MySQL数据源",
    "type": "mysql",
    "url": "mysql://localhost:3306/db"
})

# 创建ETL任务
etl_task = etl_service.create_task({
    "name": "用户数据同步",
    "sourceDatasourceId": datasource["id"],
    "targetModelId": model["id"]
})
```

## 运行说明

### 后端

1. 安装依赖：
```bash
cd backend_ddd
pip install -r requirements.txt
```

2. 初始化数据库：
```bash
python init_database.py
```

3. 启动应用：
```bash
python app.py
```

### 前端

1. 复制现有前端代码到 `frontend_ddd` 目录
2. 按照 `frontend_ddd/README.md` 说明更新API调用
3. 运行前端应用

## 优势

1. **业务逻辑清晰**：业务规则封装在领域模型中，易于理解和维护
2. **可测试性强**：领域模型可以独立测试，不依赖数据库
3. **扩展性好**：通过聚合根管理，易于扩展新功能
4. **一致性保证**：通过聚合根操作，保证数据一致性
5. **领域专家友好**：领域模型反映业务概念，便于领域专家理解

## 后续工作

1. 完善前端代码适配
2. 添加单元测试
3. 添加集成测试
4. 完善文档
5. 性能优化

## 总结

本次重构成功将系统从直接数据库操作模式转换为基于DDD的领域模型驱动模式，使代码更加清晰、可维护，更符合业务需求。

