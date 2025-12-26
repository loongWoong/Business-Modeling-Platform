# 基于DDD架构的业务建模平台后端

## 架构说明

本版本基于领域驱动设计（DDD）原则重新实现，将领域模型作为核心，而非直接操作数据库。

## 目录结构

```
backend_ddd/
├── domain/                    # 领域层
│   ├── model/                # Model聚合
│   │   ├── model.py          # Model聚合根
│   │   ├── property.py       # Property实体
│   │   └── relation.py       # Relation实体
│   ├── datasource/            # Datasource聚合
│   │   ├── datasource.py     # Datasource聚合根
│   │   ├── mapping.py         # Mapping实体
│   │   └── model_table_association.py  # ModelTableAssociation实体
│   ├── etl/                   # ETL聚合
│   │   ├── etl_task.py        # ETLTask聚合根
│   │   └── etl_log.py         # ETLLog实体
│   └── shared/                # 共享领域模型
│       └── domain.py          # Domain实体
├── application/               # 应用服务层
│   ├── model_service.py       # Model应用服务
│   ├── datasource_service.py  # Datasource应用服务
│   ├── etl_service.py         # ETL应用服务
│   └── domain_service.py      # Domain应用服务
├── infrastructure/            # 基础设施层
│   ├── repository/            # 仓储实现
│   │   ├── model_repository.py
│   │   ├── datasource_repository.py
│   │   ├── etl_repository.py
│   │   └── domain_repository.py
│   └── persistence/           # 持久化
│       └── db_connection.py
├── interfaces/                # 接口层
│   └── api/                   # API路由
│       ├── model_routes.py
│       ├── datasource_routes.py
│       ├── etl_routes.py
│       └── domain_routes.py
├── app.py                     # Flask应用主文件
├── init_database.py           # 数据库初始化脚本
└── requirements.txt           # 依赖包
```

## 领域模型关系

### 聚合结构

#### Model聚合
- **聚合根**: Model
- **实体**: Property, Relation
- **业务规则**:
  - Property必须属于某个Model
  - Property的code在Model内必须唯一
  - Relation连接两个Model

#### Datasource聚合
- **聚合根**: Datasource
- **实体**: Mapping, ModelTableAssociation
- **业务规则**:
  - Mapping连接Datasource、Model和Property
  - ModelTableAssociation连接Model和Datasource的表

#### ETL聚合
- **聚合根**: ETLTask
- **实体**: ETLLog
- **业务规则**:
  - ETLLog必须属于某个ETLTask
  - ETLTask有状态管理（inactive, active, running, paused, error）

#### Domain（分类维度）
- Domain不是聚合根，作为可选的分类标签
- Models和Datasources可以关联到Domain

## 设计原则

1. **聚合根管理**: 所有对聚合内实体的操作都通过聚合根进行
2. **业务逻辑封装**: 业务规则封装在领域模型中，而非服务层
3. **仓储模式**: 仓储只操作聚合根，自动处理聚合内实体的持久化
4. **应用服务协调**: 应用服务协调领域模型和业务用例，不包含业务逻辑
5. **依赖倒置**: 领域层不依赖基础设施层

## 使用示例

### 创建Model并添加Property

```python
from application.model_service import ModelService

service = ModelService()

# 创建Model
model_data = {
    "name": "用户模型",
    "code": "user",
    "description": "用户业务模型"
}
model = service.create_model(model_data)

# 添加Property
property_data = {
    "name": "用户名",
    "code": "username",
    "type": "string",
    "required": True
}
property = service.add_property(model["id"], property_data)
```

### 创建Datasource并定义ETL任务

```python
from application.datasource_service import DatasourceService
from application.etl_service import ETLService

ds_service = DatasourceService()
etl_service = ETLService()

# 创建Datasource
datasource_data = {
    "name": "MySQL数据源",
    "type": "mysql",
    "url": "mysql://localhost:3306/db",
    "username": "user",
    "password": "pass"
}
datasource = ds_service.create_datasource(datasource_data)

# 创建ETL任务
etl_data = {
    "name": "用户数据同步",
    "sourceDatasourceId": datasource["id"],
    "targetModelId": model["id"],
    "status": "active"
}
etl_task = etl_service.create_task(etl_data)
```

## API端点

### Model API
- `GET /api/model` - 获取所有Model
- `GET /api/model/<id>` - 获取Model详情
- `POST /api/model` - 创建Model
- `PUT /api/model/<id>` - 更新Model
- `DELETE /api/model/<id>` - 删除Model
- `POST /api/model/<id>/properties` - 添加Property
- `DELETE /api/model/<id>/properties/<property_id>` - 删除Property
- `POST /api/model/relations` - 添加Relation
- `DELETE /api/model/relations/<relation_id>` - 删除Relation

### Datasource API
- `GET /api/datasource` - 获取所有Datasource
- `GET /api/datasource/<id>` - 获取Datasource详情
- `POST /api/datasource` - 创建Datasource
- `PUT /api/datasource/<id>` - 更新Datasource
- `POST /api/datasource/<id>/toggle-status` - 切换状态
- `POST /api/datasource/<id>/mappings` - 添加Mapping
- `POST /api/datasource/<id>/associations` - 添加ModelTableAssociation

### ETL API
- `GET /api/etl/tasks` - 获取所有ETLTask
- `GET /api/etl/tasks/<id>` - 获取ETLTask详情
- `POST /api/etl/tasks` - 创建ETLTask
- `POST /api/etl/tasks/<id>/activate` - 激活任务
- `POST /api/etl/tasks/<id>/pause` - 暂停任务
- `POST /api/etl/tasks/<id>/start` - 启动任务
- `POST /api/etl/tasks/<id>/complete` - 完成任务
- `POST /api/etl/tasks/<id>/logs` - 添加ETLLog

### Domain API
- `GET /api/domain` - 获取所有Domain
- `GET /api/domain/<id>` - 获取Domain详情
- `POST /api/domain` - 创建Domain
- `PUT /api/domain/<id>` - 更新Domain
- `DELETE /api/domain/<id>` - 删除Domain

## 运行

1. 安装依赖:
```bash
pip install -r requirements.txt
```

2. 初始化数据库:
```bash
python init_database.py
```

3. 启动应用:
```bash
python app.py
```

应用将在 `http://localhost:5000` 启动。

## 与旧版本的区别

1. **领域模型为核心**: 所有业务逻辑封装在领域模型中
2. **聚合根管理**: 通过聚合根操作聚合内的实体
3. **仓储模式**: 仓储自动处理聚合的加载和保存
4. **业务规则验证**: 在领域模型中验证业务规则
5. **清晰的层次结构**: 领域层、应用层、基础设施层、接口层分离

