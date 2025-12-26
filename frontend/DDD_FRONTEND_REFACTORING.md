# 前端DDD领域建模重构总结

## 重构目标

基于DDD领域建模思想和Palantir Foundry的本体论思想，重构前端页面功能结构，确保符合聚合边界和领域模型关系。

## 领域模型关系

### 独立聚合

1. **Model 聚合**
   - Model (聚合根)
   - Property (实体，必须属于Model)
   - Relation (实体，连接两个Model)

2. **Datasource 聚合**
   - Datasource (聚合根)
   - Mapping (实体，连接Datasource-Model-Property)
   - ModelTableAssociation (实体，连接Model-Datasource)

3. **ETL 聚合**
   - ETLTask (聚合根，连接Datasource和Model)
   - ETLLog (实体，属于ETLTask)

### 分类维度

- **Domain (分类/组织维度)**
  - 可选的分类标签（models.domainId）
  - 域级别共享资源（sharedAttributes, indicators, functions）
  - 可选的分类标签（datasources.domainId）

## 重构内容

### 1. 路由结构重构 (`App.jsx`)

**重构前：**
- `/` - DomainMap
- `/domain/:domainId` - DomainWorkbench
- `/model/:modelId` - ModelDetail
- `/etl` - ETLManager

**重构后：**
- `/` - DomainMap（业务域地图，展示所有Domain）
- `/domain/:domainId` - DomainWorkbench（Domain概览，展示该Domain下的Models和Datasources）
- `/model/:modelId` - ModelDetail（Model聚合管理：Model + Properties + Relations）
- `/datasource/:datasourceId` - DatasourceDetail（**新增**，Datasource聚合管理：Datasource + Mappings + Associations）
- `/etl` - ETLManager（ETL聚合管理：ETLTask + ETLLog）

**设计原则：**
- 每个聚合有独立的详情页面
- Domain作为分类维度，不是聚合根
- DomainWorkbench作为Domain的概览页面，展示该Domain下的资源

### 2. 新增DatasourceDetail页面

**位置：** `frontend/src/pages/DatasourceDetail/`

**功能模块：**
- `DatasourceDetail.jsx` - 主页面
- `components/Notification.jsx` - 通知组件
- `modules/DatasourceInfo.jsx` - 数据源基本信息管理
- `modules/MappingManager.jsx` - 字段映射管理（Mapping实体）
- `modules/AssociationManager.jsx` - 模型表关联管理（ModelTableAssociation实体）

**符合DDD聚合边界：**
- Datasource是聚合根
- Mapping和ModelTableAssociation是聚合内的实体
- 所有操作都通过Datasource聚合根进行

### 3. 优化DomainWorkbench

**职责明确：**
- Domain作为分类维度，不是聚合根
- DomainWorkbench作为Domain的概览页面，展示该Domain下的Models和Datasources
- 可以跳转到ModelDetail或DatasourceDetail进行详细管理
- 管理Domain级别的共享资源（SharedAttributes、Indicators、Functions）

**修改内容：**
- 更新DatasourceManager，支持跳转到DatasourceDetail
- 添加注释说明Domain的职责

### 4. 优化ModelDetail

**符合DDD聚合边界：**
- 只管理Model聚合内的内容（Properties、Relations）
- "关联数据源"Tab改为只查看，不直接管理
- 点击数据源名称跳转到DatasourceDetail进行管理

**修改内容：**
- 将"关联表"Tab改名为"关联数据源"
- 更新DatasourceManager，移除直接管理功能，改为跳转到DatasourceDetail
- 明确Model聚合的边界

### 5. DomainWorkbench中的DatasourceManager优化

**修改内容：**
- 添加注释说明Domain作为分类维度的职责
- 支持通过navigate跳转到DatasourceDetail
- 明确这是概览页面，不是管理页面

## 设计原则

### DDD聚合边界

1. **Model聚合**
   - ModelDetail页面只管理Model聚合内的内容
   - Properties和Relations通过Model聚合根管理

2. **Datasource聚合**
   - DatasourceDetail页面管理Datasource聚合
   - Mappings和Associations通过Datasource聚合根管理
   - ModelDetail只能查看关联的数据源，不能直接管理

3. **ETL聚合**
   - ETLManager管理ETL聚合
   - ETLLog通过ETLTask聚合根管理

### Domain作为分类维度

- Domain不是聚合根，是分类/组织维度
- DomainWorkbench作为概览页面，展示Domain下的资源
- 实际的聚合管理在各自的Detail页面进行

### Palantir Foundry思想

1. **本体论（Ontology）**
   - 实体、关系、属性的层次结构
   - 清晰的聚合边界

2. **工作空间（Workspace）**
   - Domain作为工作空间，组织Models和Datasources
   - 每个聚合有独立的详情页面

3. **数据血缘（Lineage）**
   - ModelDetail中的血缘分析功能
   - 追踪数据流向

4. **语义层（Semantic Layer）**
   - Domain级别的共享资源（SharedAttributes、Indicators、Functions）
   - 在DomainWorkbench中管理

## 文件结构

```
frontend/src/
├── App.jsx                          # 路由配置（已更新）
├── pages/
│   ├── DomainMap/                   # 业务域地图
│   ├── DomainWorkbench/             # Domain概览（已优化）
│   │   ├── DomainWorkbench.jsx
│   │   └── modules/
│   │       └── DatasourceManager.jsx  # 已优化，支持跳转
│   ├── ModelDetail/                  # Model聚合管理（已优化）
│   │   ├── ModelDetail.jsx
│   │   └── modules/
│   │       └── DatasourceManager.jsx  # 已优化，只查看不管理
│   ├── DatasourceDetail/            # 新增：Datasource聚合管理
│   │   ├── DatasourceDetail.jsx
│   │   ├── components/
│   │   │   └── Notification.jsx
│   │   └── modules/
│   │       ├── DatasourceInfo.jsx
│   │       ├── MappingManager.jsx
│   │       └── AssociationManager.jsx
│   └── ETLManager/                   # ETL聚合管理
└── services/
    └── api.js                        # API服务层（保持不变，保证兼容性）
```

## 兼容性保证

1. **API接口保持不变**
   - 所有现有的API接口都保持不变
   - 前端只是重新组织页面结构，不改变API调用

2. **向后兼容**
   - 现有的功能都保留
   - 只是调整了页面组织和导航方式

## 后续优化建议

1. **后端API增强**
   - 可以考虑添加专门的Mapping和Association的CRUD接口
   - 当前通过Datasource聚合根管理，符合DDD原则

2. **ETLManager优化**
   - 确保ETLManager符合ETL聚合边界
   - ETLLog通过ETLTask聚合根管理

3. **Domain级别共享资源**
   - 在DomainWorkbench中完善SharedAttributes、Indicators、Functions的管理
   - 这些是Domain级别的资源，不属于任何聚合

4. **导航优化**
   - 添加面包屑导航
   - 优化页面间的跳转体验

## 总结

本次重构基于DDD领域建模思想，明确了聚合边界，将Datasource聚合的管理独立出来，创建了DatasourceDetail页面。同时优化了DomainWorkbench和ModelDetail，使其更符合DDD原则和Palantir Foundry的本体论思想。

重构后的结构更加清晰，每个聚合有独立的详情页面，Domain作为分类维度，在DomainWorkbench中概览资源，在各自的Detail页面进行详细管理。

