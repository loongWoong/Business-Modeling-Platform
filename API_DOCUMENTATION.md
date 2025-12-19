# 后端接口说明文档

## 1. 概述

本文档描述了业务域建模平台后端API的详细信息，包括接口URL、请求方法、参数、响应格式等。当前后端基于Python Flask框架实现，使用模拟数据存储。

## 2. 接口分类

### 2.1 业务域相关接口

| 接口URL | 请求方法 | 功能描述 |
|---------|----------|----------|
| `/api/domain/list` | GET | 获取业务域列表和关系边 |
| `/api/domain` | POST | 新建业务域 |
| `/api/domain/<id>` | PUT | 更新业务域 |
| `/api/domain/<id>` | DELETE | 删除业务域 |

#### 2.1.1 获取业务域列表

**请求URL**：`/api/domain/list`

**请求方法**：GET

**请求参数**：无

**响应格式**：
```json
{
  "domains": [
    {
      "id": 1,
      "name": "收费域",
      "description": "管理高速公路收费相关业务",
      "owner": "收费管理部",
      "updatedAt": "2025-12-19"
    },
    // 更多业务域...
  ],
  "edges": [
    {
      "source": 1,
      "target": 2
    },
    // 更多关系边...
  ]
}
```

#### 2.1.2 新建业务域

**请求URL**：`/api/domain`

**请求方法**：POST

**请求参数**：
```json
{
  "name": "业务域名称",
  "description": "业务域描述",
  "owner": "负责人"
}
```

**响应格式**：
```json
{
  "id": 6,
  "name": "业务域名称",
  "description": "业务域描述",
  "owner": "负责人",
  "updatedAt": "2025-12-19"
}
```

#### 2.1.3 更新业务域

**请求URL**：`/api/domain/<id>`

**请求方法**：PUT

**请求参数**：
```json
{
  "name": "更新后的名称",
  "description": "更新后的描述",
  "owner": "更新后的负责人"
}
```

**响应格式**：
```json
{
  "id": 1,
  "name": "更新后的名称",
  "description": "更新后的描述",
  "owner": "更新后的负责人",
  "updatedAt": "2025-12-19"
}
```

#### 2.1.4 删除业务域

**请求URL**：`/api/domain/<id>`

**请求方法**：DELETE

**请求参数**：无

**响应格式**：
```json
{
  "message": "Domain deleted"
}
```

### 2.2 模型相关接口

| 接口URL | 请求方法 | 功能描述 |
|---------|----------|----------|
| `/api/model` | GET | 获取模型列表和关系边 |
| `/api/model` | POST | 新建模型 |
| `/api/model/<id>` | PUT | 更新模型 |
| `/api/model/<id>` | DELETE | 删除模型 |

#### 2.2.1 获取模型列表

**请求URL**：`/api/model`

**请求方法**：GET

**请求参数**：
- `domainId`（可选）：业务域ID，用于筛选特定业务域下的模型

**响应格式**：
```json
{
  "models": [
    {
      "id": 1,
      "name": "收费规则",
      "description": "高速公路收费规则定义",
      "creator": "收费管理部",
      "updatedAt": "2025-12-19",
      "domainId": 1
    },
    // 更多模型...
  ],
  "edges": [
    {
      "source": 1,
      "target": 2
    },
    // 更多关系边...
  ]
}
```

#### 2.2.2 新建模型

**请求URL**：`/api/model`

**请求方法**：POST

**请求参数**：
```json
{
  "name": "模型名称",
  "description": "模型描述",
  "creator": "创建者",
  "domainId": 1
}
```

**响应格式**：
```json
{
  "id": 11,
  "name": "模型名称",
  "description": "模型描述",
  "creator": "创建者",
  "updatedAt": "2025-12-19",
  "domainId": 1
}
```

#### 2.2.3 更新模型

**请求URL**：`/api/model/<id>`

**请求方法**：PUT

**请求参数**：
```json
{
  "name": "更新后的名称",
  "description": "更新后的描述",
  "creator": "更新后的创建者"
}
```

**响应格式**：
```json
{
  "id": 1,
  "name": "更新后的名称",
  "description": "更新后的描述",
  "creator": "更新后的创建者",
  "updatedAt": "2025-12-19",
  "domainId": 1
}
```

#### 2.2.4 删除模型

**请求URL**：`/api/model/<id>`

**请求方法**：DELETE

**请求参数**：无

**响应格式**：
```json
{
  "message": "Model deleted"
}
```

### 2.3 属性相关接口

| 接口URL | 请求方法 | 功能描述 |
|---------|----------|----------|
| `/api/property` | GET | 获取属性列表 |
| `/api/property` | POST | 新建属性 |
| `/api/property/<id>` | DELETE | 删除属性 |

#### 2.3.1 获取属性列表

**请求URL**：`/api/property`

**请求方法**：GET

**请求参数**：
- `modelId`（可选）：模型ID，用于筛选特定模型下的属性

**响应格式**：
```json
[
  {
    "id": 1,
    "name": "规则ID",
    "type": "string",
    "required": true,
    "description": "收费规则唯一标识",
    "modelId": 1
  },
  // 更多属性...
]
```

#### 2.3.2 新建属性

**请求URL**：`/api/property`

**请求方法**：POST

**请求参数**：
```json
{
  "name": "属性名称",
  "type": "string",
  "required": true,
  "description": "属性描述",
  "modelId": 1
}
```

**响应格式**：
```json
{
  "id": 24,
  "name": "属性名称",
  "type": "string",
  "required": true,
  "description": "属性描述",
  "modelId": 1
}
```

#### 2.3.3 删除属性

**请求URL**：`/api/property/<id>`

**请求方法**：DELETE

**请求参数**：无

**响应格式**：
```json
{
  "message": "Property deleted"
}
```

### 2.4 关系相关接口

| 接口URL | 请求方法 | 功能描述 |
|---------|----------|----------|
| `/api/relation` | GET | 获取关系列表 |
| `/api/relation` | POST | 新建关系 |
| `/api/relation/<id>` | PUT | 更新关系 |
| `/api/relation/<id>` | DELETE | 删除关系 |

#### 2.4.1 获取关系列表

**请求URL**：`/api/relation`

**请求方法**：GET

**请求参数**：
- `modelId`（可选）：模型ID，用于筛选特定模型的关系

**响应格式**：
```json
[
  {
    "id": 1,
    "name": "适用于",
    "targetModel": "通行记录",
    "type": "one-to-many",
    "description": "收费规则适用于通行记录",
    "sourceModelId": 1,
    "enabled": true
  },
  // 更多关系...
]
```

#### 2.4.2 新建关系

**请求URL**：`/api/relation`

**请求方法**：POST

**请求参数**：
```json
{
  "name": "关系名称",
  "sourceModelId": 1,
  "targetModel": "目标模型名称",
  "type": "one-to-many",
  "description": "关系描述",
  "enabled": true
}
```

**响应格式**：
```json
{
  "id": 10,
  "name": "关系名称",
  "sourceModelId": 1,
  "targetModel": "目标模型名称",
  "type": "one-to-many",
  "description": "关系描述",
  "enabled": true
}
```

#### 2.4.3 更新关系

**请求URL**：`/api/relation/<id>`

**请求方法**：PUT

**请求参数**：
```json
{
  "name": "更新后的关系名称",
  "targetModel": "更新后的目标模型名称",
  "type": "many-to-one",
  "description": "更新后的关系描述",
  "enabled": false
}
```

**响应格式**：
```json
{
  "id": 1,
  "name": "更新后的关系名称",
  "sourceModelId": 1,
  "targetModel": "更新后的目标模型名称",
  "type": "many-to-one",
  "description": "更新后的关系描述",
  "enabled": false
}
```

#### 2.4.4 删除关系

**请求URL**：`/api/relation/<id>`

**请求方法**：DELETE

**请求参数**：无

**响应格式**：
```json
{
  "message": "Relation deleted"
}
```

### 2.5 共享属性相关接口

| 接口URL | 请求方法 | 功能描述 |
|---------|----------|----------|
| `/api/shared-attribute` | GET | 获取共享属性列表 |
| `/api/shared-attribute` | POST | 新建共享属性 |
| `/api/shared-attribute/<id>` | PUT | 更新共享属性 |
| `/api/shared-attribute/<id>` | DELETE | 删除共享属性 |

#### 2.5.1 获取共享属性列表

**请求URL**：`/api/shared-attribute`

**请求方法**：GET

**请求参数**：无

**响应格式**：
```json
[
  {
    "id": 1,
    "name": "共享属性名称",
    "type": "string",
    "length": "255",
    "precision": "",
    "description": "共享属性描述",
    "valueRange": "",
    "referenceCount": 0
  },
  // 更多共享属性...
]
```

#### 2.5.2 新建共享属性

**请求URL**：`/api/shared-attribute`

**请求方法**：POST

**请求参数**：
```json
{
  "name": "共享属性名称",
  "type": "string",
  "length": "255",
  "precision": "",
  "description": "共享属性描述",
  "valueRange": ""
}
```

**响应格式**：
```json
{
  "id": 1,
  "name": "共享属性名称",
  "type": "string",
  "length": "255",
  "precision": "",
  "description": "共享属性描述",
  "valueRange": "",
  "referenceCount": 0
}
```

#### 2.5.3 更新共享属性

**请求URL**：`/api/shared-attribute/<id>`

**请求方法**：PUT

**请求参数**：
```json
{
  "name": "更新后的共享属性名称",
  "type": "number",
  "length": "",
  "precision": "10,2",
  "description": "更新后的共享属性描述",
  "valueRange": "0-100"
}
```

**响应格式**：
```json
{
  "id": 1,
  "name": "更新后的共享属性名称",
  "type": "number",
  "length": "",
  "precision": "10,2",
  "description": "更新后的共享属性描述",
  "valueRange": "0-100",
  "referenceCount": 0
}
```

#### 2.5.4 删除共享属性

**请求URL**：`/api/shared-attribute/<id>`

**请求方法**：DELETE

**请求参数**：无

**响应格式**：
```json
{
  "message": "Shared attribute deleted"
}
```

### 2.6 语义/指标相关接口

| 接口URL | 请求方法 | 功能描述 |
|---------|----------|----------|
| `/api/semantic-indicator` | GET | 获取语义/指标列表 |
| `/api/semantic-indicator` | POST | 新建语义/指标 |
| `/api/semantic-indicator/<id>` | PUT | 更新语义/指标 |
| `/api/semantic-indicator/<id>` | DELETE | 删除语义/指标 |
| `/api/semantic-indicator/<id>/publish` | POST | 发布语义/指标 |
| `/api/semantic-indicator/<id>/bind` | POST | 绑定语义/指标到模型 |
| `/api/semantic-indicator/<id>/unbind` | POST | 解绑语义/指标 |
| `/api/semantic-indicator/bound` | GET | 获取模型绑定的语义/指标 |

### 2.7 数据源相关接口

| 接口URL | 请求方法 | 功能描述 |
|---------|----------|----------|
| `/api/datasource` | GET | 获取数据源列表 |
| `/api/datasource` | POST | 新建数据源 |
| `/api/datasource/<id>` | PUT | 更新数据源 |
| `/api/datasource/<id>` | DELETE | 删除数据源 |
| `/api/datasource/<id>/toggle` | POST | 启用/停用数据源 |

#### 2.7.1 获取数据源列表

**请求URL**：`/api/datasource`

**请求方法**：GET

**请求参数**：
- `modelId`（可选）：模型ID，用于筛选特定模型的数据源

**响应格式**：
```json
[
  {
    "id": 1,
    "name": "MySQL数据库",
    "type": "mysql",
    "url": "jdbc:mysql://localhost:3306/expressway",
    "tableName": "t_vehicle",
    "status": "active",
    "description": "车辆信息表"
  },
  // 更多数据源...
]
```

#### 2.7.2 新建数据源

**请求URL**：`/api/datasource`

**请求方法**：POST

**请求参数**：
```json
{
  "name": "数据源名称",
  "type": "mysql",
  "url": "数据库连接URL",
  "tableName": "表名",
  "status": "inactive",
  "description": "数据源描述"
}
```

**响应格式**：
```json
{
  "id": 1,
  "name": "数据源名称",
  "type": "mysql",
  "url": "数据库连接URL",
  "tableName": "表名",
  "status": "inactive",
  "description": "数据源描述"
}
```

#### 2.7.3 更新数据源

**请求URL**：`/api/datasource/<id>`

**请求方法**：PUT

**请求参数**：
```json
{
  "name": "更新后的数据源名称",
  "type": "mysql",
  "url": "更新后的数据库连接URL",
  "tableName": "更新后的表名",
  "description": "更新后的数据源描述"
}
```

**响应格式**：
```json
{
  "id": 1,
  "name": "更新后的数据源名称",
  "type": "mysql",
  "url": "更新后的数据库连接URL",
  "tableName": "更新后的表名",
  "status": "active",
  "description": "更新后的数据源描述"
}
```

#### 2.7.4 删除数据源

**请求URL**：`/api/datasource/<id>`

**请求方法**：DELETE

**请求参数**：无

**响应格式**：
```json
{
  "message": "Datasource deleted"
}
```

#### 2.7.5 启用/停用数据源

**请求URL**：`/api/datasource/<id>/toggle`

**请求方法**：POST

**请求参数**：无

**响应格式**：
```json
{
  "id": 1,
  "name": "数据源名称",
  "type": "mysql",
  "url": "数据库连接URL",
  "tableName": "表名",
  "status": "inactive",
  "description": "数据源描述"
}
```

### 2.8 数据记录相关接口

| 接口URL | 请求方法 | 功能描述 |
|---------|----------|----------|
| `/api/data` | GET | 获取数据记录列表 |
| `/api/data` | POST | 新建数据记录 |
| `/api/data/<id>` | PUT | 更新数据记录 |
| `/api/data/<id>` | DELETE | 删除数据记录 |

#### 2.8.1 获取数据记录列表

**请求URL**：`/api/data`

**请求方法**：GET

**请求参数**：
- `datasourceId`（必填）：数据源ID，用于获取特定数据源的数据记录

**响应格式**：
```json
[
  {
    "id": 1,
    "licensePlate": "京A12345",
    "vehicleType": "小型客车",
    "entryTime": "2025-12-19 08:00:00",
    "exitTime": "2025-12-19 08:30:00",
    "tollFee": 50.0
  },
  // 更多数据记录...
]
```

#### 2.8.2 新建数据记录

**请求URL**：`/api/data`

**请求方法**：POST

**请求参数**：
```json
{
  "datasourceId": 1,
  "data": {
    "licensePlate": "新的车牌号",
    "vehicleType": "小型客车",
    "entryTime": "2025-12-19 09:00:00",
    "exitTime": "2025-12-19 09:30:00",
    "tollFee": 60.0
  }
}
```

**响应格式**：
```json
{
  "id": 4,
  "licensePlate": "新的车牌号",
  "vehicleType": "小型客车",
  "entryTime": "2025-12-19 09:00:00",
  "exitTime": "2025-12-19 09:30:00",
  "tollFee": 60.0,
  "createdAt": "2025-12-19T10:00:00Z"
}
```

#### 2.8.3 更新数据记录

**请求URL**：`/api/data/<id>`

**请求方法**：PUT

**请求参数**：
```json
{
  "licensePlate": "更新后的车牌号",
  "vehicleType": "小型客车",
  "tollFee": 70.0
}
```

**响应格式**：
```json
{
  "id": 1,
  "licensePlate": "更新后的车牌号",
  "vehicleType": "小型客车",
  "entryTime": "2025-12-19 08:00:00",
  "exitTime": "2025-12-19 08:30:00",
  "tollFee": 70.0,
  "updatedAt": "2025-12-19T10:00:00Z"
}
```

#### 2.8.4 删除数据记录

**请求URL**：`/api/data/<id>`

**请求方法**：DELETE

**请求参数**：无

**响应格式**：
```json
{
  "message": "Data record deleted"
}
```

## 3. 数据模型

### 3.1 业务域（Domain）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | integer | 业务域唯一标识 |
| name | string | 业务域名称 |
| description | string | 业务域描述 |
| owner | string | 负责人 |
| updatedAt | string | 最后更新时间 |

### 3.2 模型（Model）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | integer | 模型唯一标识 |
| name | string | 模型名称 |
| description | string | 模型描述 |
| creator | string | 创建者 |
| updatedAt | string | 最后更新时间 |
| domainId | integer | 所属业务域ID |

### 3.3 属性（Property）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | integer | 属性唯一标识 |
| name | string | 属性名称 |
| type | string | 属性类型 |
| required | boolean | 是否必填 |
| description | string | 属性描述 |
| modelId | integer | 所属模型ID |

### 3.4 关系（Relation）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | integer | 关系唯一标识 |
| name | string | 关系名称 |
| targetModel | string | 目标模型名称 |
| type | string | 关系类型（one-to-one, one-to-many, many-to-one） |
| description | string | 关系描述 |
| sourceModelId | integer | 源模型ID |
| enabled | boolean | 是否启用 |

### 3.5 共享属性（SharedAttribute）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | integer | 共享属性唯一标识 |
| name | string | 共享属性名称 |
| type | string | 数据类型 |
| length | string | 长度限制 |
| precision | string | 精度 |
| description | string | 属性描述 |
| valueRange | string | 取值范围 |
| referenceCount | integer | 引用次数 |

### 3.6 语义/指标（SemanticIndicator）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | integer | 指标唯一标识 |
| name | string | 指标名称 |
| expression | string | 计算表达式 |
| returnType | string | 返回类型 |
| description | string | 指标描述 |
| status | string | 状态（draft/published） |
| unit | string | 计量单位 |

### 3.7 模型-指标绑定（ModelIndicatorBinding）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | integer | 绑定唯一标识 |
| modelId | integer | 模型ID |
| indicatorId | integer | 指标ID |
| createdAt | string | 绑定时间 |

### 3.8 数据源（Datasource）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | integer | 数据源唯一标识 |
| name | string | 数据源名称 |
| type | string | 数据源类型（mysql/oracle/kafka/api） |
| url | string | 连接URL |
| tableName | string | 表名/主题名 |
| status | string | 状态（active/inactive） |
| description | string | 数据源描述 |

### 3.9 数据记录（DataRecord）

| 字段名 | 类型 | 描述 |
|--------|------|------|
| id | integer | 数据记录唯一标识 |
| datasourceId | integer | 所属数据源ID |
| data | object | 数据内容（动态字段） |
| createdAt | string | 创建时间 |
| updatedAt | string | 更新时间 |

## 4. 错误处理

| 错误码 | 描述 |
|--------|------|
| 404 | 资源未找到 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |

# Python转Java重构指导

## 1. 重构概述

本文档提供了将当前Python Flask后端应用重构为Java技术栈的完整指导，包括技术选型、架构设计、代码迁移等方面。

## 2. 技术选型

### 2.1 核心框架

| 技术 | 版本 | 用途 |
|------|------|------|
| Spring Boot | 3.2.x | 应用框架，提供自动配置、依赖注入等功能 |
| Spring Web | 3.2.x | Web框架，处理HTTP请求 |
| Spring Data JPA | 3.2.x | ORM框架，简化数据库操作 |
| Hibernate | 6.x | JPA实现 |
| MySQL | 8.x | 关系型数据库 |

### 2.2 辅助工具

| 工具 | 用途 |
|------|------|
| Maven | 项目构建和依赖管理 |
| Lombok | 简化Java代码，减少样板代码 |
| Swagger/OpenAPI | API文档生成 |
| JUnit 5 | 单元测试 |
| Mockito | 测试 mocking 框架 |
| Spring Boot DevTools | 开发热部署 |

## 3. 架构设计

### 3.1 分层架构

```
├── controller/      # 控制器层，处理HTTP请求
├── service/         # 业务逻辑层
├── repository/      # 数据访问层
├── model/           # 数据模型层
│   ├── entity/      # JPA实体类
│   └── dto/         # 数据传输对象
├── config/          # 配置类
└── exception/       # 异常处理
```

### 3.2 包结构设计

```
com.domainmodeling
├── DomainModelingApplication.java  # 应用入口
├── controller
│   ├── DomainController.java
│   ├── ModelController.java
│   ├── PropertyController.java
│   ├── RelationController.java
│   ├── SharedAttributeController.java
│   ├── SemanticIndicatorController.java
│   ├── DatasourceController.java
│   └── DataRecordController.java
├── service
│   ├── DomainService.java
│   ├── ModelService.java
│   ├── PropertyService.java
│   ├── RelationService.java
│   ├── SharedAttributeService.java
│   ├── SemanticIndicatorService.java
│   ├── DatasourceService.java
│   └── DataRecordService.java
├── repository
│   ├── DomainRepository.java
│   ├── DomainEdgeRepository.java
│   ├── ModelRepository.java
│   ├── ModelEdgeRepository.java
│   ├── PropertyRepository.java
│   ├── RelationRepository.java
│   ├── SharedAttributeRepository.java
│   ├── SemanticIndicatorRepository.java
│   ├── ModelIndicatorBindingRepository.java
│   ├── DatasourceRepository.java
│   └── DataRecordRepository.java
├── model
│   ├── entity
│   │   ├── Domain.java
│   │   ├── DomainEdge.java
│   │   ├── Model.java
│   │   ├── ModelEdge.java
│   │   ├── Property.java
│   │   ├── Relation.java
│   │   ├── SharedAttribute.java
│   │   ├── SemanticIndicator.java
│   │   └── ModelIndicatorBinding.java
│   └── dto
│       ├── DomainResponse.java
│       ├── ModelResponse.java
│       ├── PropertyResponse.java
│       ├── SharedAttributeResponse.java
│       └── SemanticIndicatorResponse.java
├── config
│   └── WebConfig.java  # CORS配置等
└── exception
    ├── ResourceNotFoundException.java
    └── GlobalExceptionHandler.java
```

## 4. 代码迁移

### 4.1 数据模型迁移

将Python中的模拟数据模型转换为Java JPA实体类。

**Python模拟数据示例**：
```python
"domains": [
    {"id": 1, "name": "收费域", "description": "管理高速公路收费相关业务", "owner": "收费管理部", "updatedAt": "2025-12-19"}
]
```

**Java JPA实体示例**：
```java
@Entity
@Table(name = "domains")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Domain {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String name;
    
    private String description;
    
    private String owner;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @PrePersist
    @PreUpdate
    protected void onCreateOrUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### 4.2 接口迁移

将Flask路由转换为Spring MVC控制器方法。

**Python Flask路由示例**：
```python
@app.route('/api/domain/list', methods=['GET'])
def get_domain_list():
    return jsonify({
        "domains": mock_data["domains"],
        "edges": mock_data["domain_edges"]
    })
```

**Java Spring MVC控制器示例**：
```java
@RestController
@RequestMapping("/api/domain")
public class DomainController {
    
    @Autowired
    private DomainService domainService;
    
    @GetMapping("/list")
    public ResponseEntity<DomainResponse> getDomainList() {
        DomainResponse response = domainService.getDomainList();
        return ResponseEntity.ok(response);
    }
}
```

### 4.3 业务逻辑迁移

将Python中的业务逻辑转换为Java服务层方法。

**Python业务逻辑示例**：
```python
@app.route('/api/domain', methods=['POST'])
def create_domain():
    data = request.get_json()
    domain = {
        "id": len(mock_data["domains"]) + 1,
        "name": data["name"],
        "description": data["description"],
        "owner": data["owner"],
        "updatedAt": "2025-12-19"
    }
    mock_data["domains"].append(domain)
    return jsonify(domain), 201
```

**Java服务层示例**：
```java
@Service
public class DomainService {
    
    @Autowired
    private DomainRepository domainRepository;
    
    @Autowired
    private DomainEdgeRepository domainEdgeRepository;
    
    public Domain createDomain(Domain domain) {
        return domainRepository.save(domain);
    }
    
    public DomainResponse getDomainList() {
        List<Domain> domains = domainRepository.findAll();
        List<DomainEdge> edges = domainEdgeRepository.findAll();
        return new DomainResponse(domains, edges);
    }
}
```

## 5. 数据库设计

### 5.1 表结构设计

#### 5.1.1 domains表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 业务域ID |
| name | VARCHAR(255) | NOT NULL | 业务域名称 |
| description | TEXT | | 业务域描述 |
| owner | VARCHAR(255) | | 负责人 |
| updated_at | DATETIME | NOT NULL | 最后更新时间 |

#### 5.1.2 domain_edges表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 边ID |
| source | BIGINT | NOT NULL, FOREIGN KEY | 源业务域ID |
| target | BIGINT | NOT NULL, FOREIGN KEY | 目标业务域ID |

#### 5.1.3 models表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 模型ID |
| name | VARCHAR(255) | NOT NULL | 模型名称 |
| description | TEXT | | 模型描述 |
| creator | VARCHAR(255) | | 创建者 |
| domain_id | BIGINT | NOT NULL, FOREIGN KEY | 所属业务域ID |
| updated_at | DATETIME | NOT NULL | 最后更新时间 |

#### 5.1.4 model_edges表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 边ID |
| source | BIGINT | NOT NULL, FOREIGN KEY | 源模型ID |
| target | BIGINT | NOT NULL, FOREIGN KEY | 目标模型ID |

#### 5.1.5 properties表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 属性ID |
| name | VARCHAR(255) | NOT NULL | 属性名称 |
| type | VARCHAR(50) | NOT NULL | 属性类型 |
| required | BOOLEAN | NOT NULL | 是否必填 |
| description | TEXT | | 属性描述 |
| model_id | BIGINT | NOT NULL, FOREIGN KEY | 所属模型ID |

#### 5.1.6 relations表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 关系ID |
| name | VARCHAR(255) | NOT NULL | 关系名称 |
| target_model | VARCHAR(255) | NOT NULL | 目标模型名称 |
| type | VARCHAR(50) | NOT NULL | 关系类型 |
| description | TEXT | | 关系描述 |
| source_model_id | BIGINT | NOT NULL, FOREIGN KEY | 源模型ID |
| enabled | BOOLEAN | NOT NULL DEFAULT TRUE | 是否启用 |

#### 5.1.7 shared_attributes表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 共享属性ID |
| name | VARCHAR(255) | NOT NULL | 共享属性名称 |
| type | VARCHAR(50) | NOT NULL | 数据类型 |
| length | VARCHAR(20) | | 长度限制 |
| precision | VARCHAR(20) | | 精度 |
| description | TEXT | | 属性描述 |
| value_range | VARCHAR(255) | | 取值范围 |
| reference_count | INT | NOT NULL DEFAULT 0 | 引用次数 |

#### 5.1.8 semantic_indicators表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 指标ID |
| name | VARCHAR(255) | NOT NULL | 指标名称 |
| expression | TEXT | NOT NULL | 计算表达式 |
| return_type | VARCHAR(50) | NOT NULL | 返回类型 |
| description | TEXT | | 指标描述 |
| status | VARCHAR(20) | NOT NULL DEFAULT 'draft' | 状态（draft/published） |
| unit | VARCHAR(50) | | 计量单位 |

#### 5.1.9 model_indicator_bindings表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 绑定ID |
| model_id | BIGINT | NOT NULL, FOREIGN KEY | 模型ID |
| indicator_id | BIGINT | NOT NULL, FOREIGN KEY | 指标ID |
| created_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 绑定时间 |

#### 5.1.10 datasources表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 数据源ID |
| name | VARCHAR(255) | NOT NULL | 数据源名称 |
| type | VARCHAR(50) | NOT NULL | 数据源类型 |
| url | VARCHAR(255) | NOT NULL | 连接URL |
| table_name | VARCHAR(255) | NOT NULL | 表名/主题名 |
| status | VARCHAR(20) | NOT NULL DEFAULT 'inactive' | 状态 |
| description | TEXT | | 数据源描述 |
| model_id | BIGINT | NOT NULL, FOREIGN KEY | 所属模型ID |

#### 5.1.11 data_records表

| 字段名 | 数据类型 | 约束 | 描述 |
|--------|----------|------|------|
| id | BIGINT | PRIMARY KEY, AUTO_INCREMENT | 数据记录ID |
| datasource_id | BIGINT | NOT NULL, FOREIGN KEY | 所属数据源ID |
| data | JSON | NOT NULL | 数据内容（动态字段） |
| created_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP | 创建时间 |
| updated_at | DATETIME | NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | 更新时间 |

## 6. 配置文件

### 6.1 application.properties

```properties
# 应用配置
spring.application.name=domain-modeling
server.port=5000

# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/domain_modeling?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# CORS配置
spring.web.cors.allowed-origins=*
spring.web.cors.allowed-methods=GET, POST, PUT, DELETE, OPTIONS
spring.web.cors.allowed-headers=*
```

## 7. 测试策略

### 7.1 单元测试

使用JUnit 5和Mockito对各个组件进行单元测试，重点测试：
- 控制器层的请求处理
- 服务层的业务逻辑
- 数据访问层的数据库操作

### 7.2 集成测试

使用Spring Boot Test进行集成测试，测试：
- 完整的HTTP请求流程
- 数据库操作的正确性
- 异常处理

### 7.3 API测试

使用Postman或Swagger UI进行API测试，验证：
- 所有API端点的正确性
- 请求和响应格式
- 错误处理

## 8. 部署方案

### 8.1 开发环境

- 本地开发：使用Spring Boot DevTools进行热部署
- 数据库：本地MySQL或Docker容器

### 8.2 生产环境

- 应用服务器：Tomcat或Jetty（嵌入在Spring Boot中）
- 数据库：生产级MySQL集群
- 部署方式：Docker容器化部署或传统WAR包部署
- 监控：Spring Boot Actuator + Prometheus + Grafana

## 9. 性能优化

1. **数据库优化**：
   - 合理设计索引
   - 使用分页查询处理大量数据
   - 优化SQL查询

2. **缓存策略**：
   - 使用Spring Cache + Redis缓存频繁访问的数据
   - 缓存业务域、模型等不经常变化的数据

3. **异步处理**：
   - 对耗时操作使用异步处理
   - 使用Spring @Async注解

4. **连接池优化**：
   - 配置合适的数据库连接池大小
   - 使用HikariCP作为连接池

## 10. 安全考虑

1. **认证与授权**：
   - 集成Spring Security
   - 实现基于角色的访问控制

2. **API安全**：
   - 实现请求限流
   - 防止SQL注入
   - 防止XSS攻击
   - 实现API密钥认证或OAuth 2.0

3. **数据安全**：
   - 敏感数据加密存储
   - 实现数据脱敏

## 11. 重构步骤

1. **搭建Java项目结构**：
   - 使用Spring Initializr创建Spring Boot项目
   - 配置依赖和基本配置

2. **数据模型迁移**：
   - 创建JPA实体类
   - 配置数据库连接
   - 初始化数据库表

3. **代码迁移**：
   - 实现数据访问层
   - 实现业务逻辑层
   - 实现控制器层

4. **测试验证**：
   - 编写单元测试和集成测试
   - 验证所有API端点
   - 测试异常处理

5. **优化和部署**：
   - 性能优化
   - 安全配置
   - 部署到生产环境

## 12. 注意事项

1. **数据迁移**：
   - 确保数据模型的兼容性
   - 考虑数据迁移策略

2. **API兼容性**：
   - 保持API端点和响应格式的兼容性
   - 考虑版本控制策略

3. **性能考虑**：
   - 注意Java和Python性能特点的差异
   - 优化关键路径

4. **团队协作**：
   - 确保团队成员熟悉Java技术栈
   - 提供必要的培训和文档

5. **监控和日志**：
   - 实现完善的日志记录
   - 配置监控系统

通过以上步骤，可以将当前的Python Flask后端应用成功重构为Java Spring Boot应用，同时保持API兼容性和功能完整性。