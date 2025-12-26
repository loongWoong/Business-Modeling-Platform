# 前端适配说明 - DDD版本

## 概述

本目录包含适配新的DDD架构后端API的前端代码。

## 主要变化

### API调用方式

使用统一的API服务层 (`src/services/api.js`) 来调用后端API，而不是直接使用fetch。

### 数据获取方式

- **旧版本**：分别获取model、properties、relations
- **新版本**：一次API调用获取所有数据（通过聚合根）

### 操作方式

- **旧版本**：直接操作Property和Relation端点
- **新版本**：通过Model聚合根操作Property和Relation

## 项目结构

```
frontend_ddd/
├── src/
│   ├── services/
│   │   └── api.js              # API服务层
│   ├── pages/
│   │   ├── ModelDetail/        # Model详情页面
│   │   │   ├── ModelDetail.jsx
│   │   │   └── modules/
│   │   │       ├── PropertyManager.jsx
│   │   │       └── RelationManager.jsx
│   │   └── DomainWorkbench/    # Domain工作台
│   │       └── DomainWorkbench.jsx
│   ├── App.jsx                 # 主应用组件
│   ├── main.jsx                # 入口文件
│   └── index.css               # 样式文件
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 安装和运行

### 1. 安装依赖

```bash
cd frontend_ddd
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:3000` 启动。

### 3. 确保后端服务运行

确保后端服务在 `http://localhost:5000` 运行：

```bash
cd ../backend_ddd
python run.py
```

## API服务层

所有API调用都通过 `src/services/api.js` 进行：

```javascript
import { modelAPI, datasourceAPI, etlAPI, domainAPI } from './services/api';

// 获取Model详情
const { model, properties, relations } = await modelAPI.getById(modelId);

// 添加Property
await modelAPI.addProperty(modelId, propertyData);

// 添加Relation
await modelAPI.addRelation(relationData);
```

## 已适配的组件

### 1. ModelDetail
- ✅ 使用新API获取Model详情（包含properties和relations）
- ✅ 通过聚合根添加/删除Property
- ✅ 通过聚合根添加/删除Relation

### 2. PropertyManager
- ✅ 使用 `modelAPI.addProperty()` 添加Property
- ✅ 使用 `modelAPI.removeProperty()` 删除Property

### 3. RelationManager
- ✅ 使用 `modelAPI.addRelation()` 添加Relation
- ✅ 使用 `modelAPI.removeRelation()` 删除Relation

### 4. DomainWorkbench
- ✅ 使用新API获取Domain下的Models和Datasources

## 待适配的组件

以下组件需要从原前端代码迁移并适配：

- [ ] DomainMap - Domain地图视图
- [ ] ETLManager - ETL任务管理
- [ ] DatasourceManager - 数据源管理（完整功能）
- [ ] 其他辅助组件

## 迁移指南

详细的迁移指南请参考 `MIGRATION_GUIDE.md`。

## API端点映射

### Model相关

| 旧端点 | 新端点 | 说明 |
|--------|--------|------|
| `GET /api/model/:id` | `GET /api/model/:id` | 返回 `{model, properties, relations}` |
| `GET /api/property?modelId=:id` | 包含在Model详情中 | 不再需要单独调用 |
| `POST /api/property` | `POST /api/model/:id/properties` | 通过聚合根添加 |
| `DELETE /api/property/:id` | `DELETE /api/model/:id/properties/:id` | 通过聚合根删除 |
| `POST /api/relation` | `POST /api/model/relations` | 通过聚合根添加 |
| `DELETE /api/relation/:id` | `DELETE /api/model/relations/:id` | 通过聚合根删除 |

### Datasource相关

| 旧端点 | 新端点 | 说明 |
|--------|--------|------|
| `GET /api/datasource/:id` | `GET /api/datasource/:id` | 返回 `{datasource, mappings, associations}` |
| `POST /api/datasource/:id/mappings` | `POST /api/datasource/:id/mappings` | 通过聚合根添加 |

### ETL相关

| 旧端点 | 新端点 | 说明 |
|--------|--------|------|
| `GET /api/etl/tasks/:id` | `GET /api/etl/tasks/:id` | 返回 `{task, logs}` |
| `POST /api/etl/tasks/:id/toggle` | `POST /api/etl/tasks/:id/activate` 或 `pause` | 状态管理 |

## 开发建议

1. **使用API服务层**：所有API调用都通过 `src/services/api.js`
2. **错误处理**：使用try-catch处理API错误
3. **数据刷新**：操作后刷新完整数据以确保一致性
4. **类型检查**：考虑使用TypeScript或PropTypes

## 测试

1. 启动后端服务
2. 启动前端开发服务器
3. 访问 `http://localhost:3000`
4. 测试各个功能：
   - 查看Model详情
   - 添加/删除Property
   - 添加/删除Relation
   - 查看Domain工作台

## 注意事项

1. **API响应格式**：新API返回格式可能不同，需要适配
2. **错误处理**：新API可能有不同的错误格式
3. **向后兼容**：某些功能可能需要后端支持

## 下一步

1. 迁移更多组件
2. 添加错误处理和加载状态
3. 优化用户体验
4. 添加单元测试
