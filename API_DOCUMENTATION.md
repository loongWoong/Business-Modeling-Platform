# API文档

## 健康检查

| 路径 | 方法 | 功能描述 | 响应格式 | 状态码 |
|------|------|----------|----------|--------|
| `/health` | GET | 检查应用健康状态 | `{"status": "healthy"}` | 200 |

## 域（Domain）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/domain/list` | GET | 获取域列表和边 | - | 域列表对象 | 200 |
| `/api/domain` | POST | 新建域 | `{"name": "域名称"}` | 新建的域对象 | 201/400/500 |
| `/api/domain/<id>` | GET | 获取单个域 | - | 域对象 | 200/404 |
| `/api/domain/<id>` | PUT | 更新域 | 更新的域数据 | 更新后的域对象 | 200/400/404 |
| `/api/domain/<id>` | DELETE | 删除域 | - | `{"message": "Domain deleted"}` | 200/404 |

## 模型（Model）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/model` | GET | 获取模型列表 | `domainId`（查询参数，可选） | 模型列表 | 200 |
| `/api/model` | POST | 新建模型 | `{"name": "模型名称", "code": "模型代码", "domainId": 域ID}` | 新建的模型对象 | 201/400/500 |
| `/api/model/<id>` | GET | 获取单个模型 | - | 模型对象 | 200/404 |
| `/api/model/<id>` | PUT | 更新模型 | 更新的模型数据 | 更新后的模型对象 | 200/400/404 |
| `/api/model/<id>` | DELETE | 删除模型 | - | `{"message": "Model deleted"}` | 200/404 |

## 属性（Property）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/property` | GET | 获取属性列表 | `modelId`（查询参数，可选） | 属性列表 | 200 |
| `/api/property/<id>` | GET | 获取单个属性 | - | 属性对象 | 200/404 |
| `/api/property` | POST | 新建属性 | `{"name": "属性名称", "type": "属性类型", "modelId": 模型ID}` | 新建的属性对象 | 201/400/500 |
| `/api/property/<id>` | PUT | 更新属性 | 更新的属性数据 | 更新后的属性对象 | 200/400/404 |
| `/api/property/<id>` | DELETE | 删除属性 | - | `{"message": "Property deleted"}` | 200/404 |

## 关系（Relation）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/relation` | GET | 获取关系列表 | `modelId`（查询参数，可选）<br>`domainId`（查询参数，可选） | 关系列表（包含源模型和目标模型名称） | 200 |
| `/api/relation/<id>` | GET | 获取单个关系 | - | 关系对象 | 200/404 |
| `/api/relation` | POST | 新建关系 | `{"name": "关系名称", "sourceModelId": 源模型ID, "targetModelId": 目标模型ID}` | 新建的关系对象 | 201/400/500 |
| `/api/relation/<id>` | PUT | 更新关系 | 更新的关系数据 | 更新后的关系对象 | 200/400/404 |
| `/api/relation/<id>` | DELETE | 删除关系 | - | `{"message": "Relation deleted", "success": true}` | 200/404 |
| `/api/relation/<id>/toggle` | PUT | 启用/禁用关系 | - | 更新后的关系对象 | 200/404 |

## 共享属性（Shared Attribute）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/shared-attribute` | GET | 获取共享属性列表 | `domainId`（查询参数，可选） | 共享属性列表 | 200 |
| `/api/shared-attribute/<id>` | GET | 获取单个共享属性 | - | 共享属性对象 | 200/404 |
| `/api/shared-attribute` | POST | 新建共享属性 | `{"name": "属性名称", "type": "属性类型", "domainId": 域ID}` | 新建的共享属性对象 | 201/400/500 |
| `/api/shared-attribute/<id>` | PUT | 更新共享属性 | 更新的共享属性数据 | 更新后的共享属性对象 | 200/400/404 |
| `/api/shared-attribute/<id>` | DELETE | 删除共享属性 | - | `{"message": "SharedAttribute deleted"}` | 200/404 |

## 指标（Indicator）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/indicator` | GET | 获取指标列表 | `domainId`（查询参数，可选） | 指标列表 | 200 |
| `/api/indicator/<id>` | GET | 获取单个指标 | - | 指标对象 | 200/404 |
| `/api/indicator` | POST | 新建指标 | `{"name": "指标名称", "domainId": 域ID}` | 新建的指标对象 | 201/400/500 |
| `/api/indicator/<id>` | PUT | 更新指标 | 更新的指标数据 | 更新后的指标对象 | 200/400/404 |
| `/api/indicator/<id>` | DELETE | 删除指标 | - | `{"message": "Indicator deleted"}` | 200/404 |
| `/api/indicator/<id>/publish` | PUT | 发布指标 | - | 更新后的指标对象 | 200/404 |
| `/api/indicator/<id>/offline` | PUT | 下线指标 | - | 更新后的指标对象 | 200/404 |

## 数据源（Datasource）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/datasource` | GET | 获取数据源列表 | `modelId`（查询参数，可选）<br>`domainId`（查询参数，可选） | 数据源列表 | 200 |
| `/api/datasource/<id>` | GET | 获取单个数据源 | - | 数据源对象 | 200/404 |
| `/api/datasource` | POST | 新建数据源 | `{"name": "数据源名称", "type": "数据源类型", "url": "数据源URL"}` | 新建的数据源对象 | 201/400/500 |
| `/api/datasource/<id>` | PUT | 更新数据源 | 更新的数据源数据 | 更新后的数据源对象 | 200/400/404 |
| `/api/datasource/<id>` | DELETE | 删除数据源 | - | `{"message": "Datasource deleted"}` | 200/404 |
| `/api/datasource/<id>/toggle` | PUT | 切换数据源状态 | - | 更新后的数据源对象 | 200/404 |
| `/api/datasource/<id>/test` | POST | 测试数据源连接 | - | 测试结果对象 | 200 |

## 函数（Function）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/function` | GET | 获取函数列表 | `domainId`（查询参数，可选） | 函数列表 | 200 |
| `/api/function` | POST | 新建函数 | `{"name": "函数名称", "description": "函数描述", "code": "函数代码", "inputSchema": {输入模式}, "returnType": "返回类型", "version": "版本号", "metadata": {元数据}, "domainId": 域ID}` | 新建的函数对象 | 201/500 |
| `/api/function/<id>` | PUT | 更新函数 | 更新的函数数据 | 更新后的函数对象 | 200/404/500 |
| `/api/function/<id>` | DELETE | 删除函数 | - | `{"message": "Function deleted", "success": true}` | 200/404/400 |

## 操作类型（Action Type）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/action-type` | GET | 获取操作类型列表 | `targetObjectTypeId`（查询参数，可选） | 操作类型列表 | 200 |
| `/api/action-type` | POST | 新建操作类型 | `{"name": "操作类型名称", "description": "操作类型描述", "targetObjectTypeId": 目标对象类型ID, "inputSchema": {输入模式}, "outputSchema": {输出模式}, "requiresApproval": 是否需要审批, "handlerFunction": 处理函数名称}` | 新建的操作类型对象 | 201/500 |
| `/api/action-type/<id>` | PUT | 更新操作类型 | 更新的操作类型数据 | 更新后的操作类型对象 | 200/404/500 |
| `/api/action-type/<id>` | DELETE | 删除操作类型 | - | `{"message": "Action type deleted", "success": true}` | 200/500 |
| `/api/action-type/<id>/execute` | POST | 执行操作类型 | 执行参数 | 执行结果对象 | 200/404/500 |

## 数据记录（Data Record）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/data` | GET | 获取模型数据记录 | `modelId`（查询参数，必填）<br>`limit`（查询参数，可选） | 数据记录列表 | 200/400/500 |
| `/api/data/<record_id>` | GET | 获取单个数据记录 | `modelId`（查询参数，必填） | 数据记录对象 | 200/400/404/500 |
| `/api/data` | POST | 创建数据记录 | `modelId`（查询参数或请求体，必填）<br>数据记录内容 | 新建的数据记录对象 | 201/400/500 |
| `/api/data/<record_id>` | PUT | 更新数据记录 | `modelId`（查询参数或请求体，必填）<br>更新的数据记录内容 | 更新的数据记录对象 | 200/400/404/500 |
| `/api/data/<record_id>` | DELETE | 删除数据记录 | `modelId`（查询参数，必填） | `{"message": "DataRecord deleted"}` | 200/400/404/500 |

## ETL任务（ETL Task）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/etl/tasks` | GET | 获取ETL任务列表 | - | ETL任务列表 | 200 |
| `/api/etl/tasks` | POST | 创建ETL任务 | `{"name": "任务名称", "description": "任务描述", "sourceDatasourceId": 源数据源ID, "targetModelId": 目标模型ID, "status": "任务状态", "schedule": "调度表达式", "config": {配置信息}}` | `{"id": 任务ID, "message": "ETL任务创建成功"}` | 201/500 |
| `/api/etl/tasks/<id>` | PUT | 更新ETL任务 | 更新的ETL任务数据 | `{"message": "ETL任务更新成功"}` | 200/500 |
| `/api/etl/tasks/<id>` | DELETE | 删除ETL任务 | - | `{"message": "ETL任务删除成功"}` | 200/500 |
| `/api/etl/tasks/<id>/execute` | POST | 执行ETL任务 | - | `{"message": "ETL任务执行成功", "processed": 处理记录数, "success": 成功记录数, "failed": 失败记录数}` | 200/404/500 |
| `/api/etl/tasks/<id>/toggle` | PUT | 启用/禁用ETL任务 | - | `{"message": "ETL任务已启用/禁用"}` | 200/404 |
| `/api/etl/logs` | GET | 获取ETL执行日志 | `taskId`（查询参数，可选） | ETL日志列表 | 200 |
| `/api/etl/generate-table-definition` | POST | 根据模型生成表定义 | `{"modelId": 模型ID}` | 表定义对象 | 200/400/404 |
| `/api/etl/datasource/<datasource_id>/tables/<table_name>/schema` | GET | 获取数据源表结构 | - | 表结构对象 | 200 |
| `/api/etl/datasource/<datasource_id>/mappings` | GET | 获取数据源字段映射 | `tableName`（查询参数，必填） | 字段映射列表 | 200/400 |

## 模型表关联（Model Table Association）

| 路径 | 方法 | 功能描述 | 请求参数 | 响应格式 | 状态码 |
|------|------|----------|----------|----------|--------|
| `/api/model-table-associations` | GET | 获取模型表关联列表 | `modelId`（查询参数，可选） | 模型表关联列表（包含数据源信息） | 200 |
| `/api/model-table-associations` | POST | 创建模型表关联 | `{"modelId": 模型ID, "datasourceId": 数据源ID, "tableName": "表名", "status": "状态"}` | 新建的模型表关联对象 | 201/400 |
| `/api/model-table-associations/<id>` | DELETE | 删除模型表关联 | - | `{"message": "Model-table association deleted", "success": true}` | 200 |
