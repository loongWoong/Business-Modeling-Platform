# 前端迁移指南

## 概述

本指南说明如何将现有前端代码迁移到适配新的DDD API结构。

## 主要变化

### 1. API调用方式

#### 旧版本
```javascript
// 分别获取model、properties、relations
const model = await fetch(`/api/model/${id}`).then(r => r.json());
const properties = await fetch(`/api/property?modelId=${id}`).then(r => r.json());
const relations = await fetch(`/api/relation?modelId=${id}`).then(r => r.json());
```

#### 新版本（DDD）
```javascript
// 一次调用获取所有数据
import { modelAPI } from './services/api';
const { model, properties, relations } = await modelAPI.getById(id);
```

### 2. Property操作

#### 旧版本
```javascript
// 直接操作Property端点
await fetch('/api/property', {
  method: 'POST',
  body: JSON.stringify(propertyData)
});
```

#### 新版本（DDD）
```javascript
// 通过Model聚合根操作
import { modelAPI } from './services/api';
await modelAPI.addProperty(modelId, propertyData);
```

### 3. Relation操作

#### 旧版本
```javascript
// 直接操作Relation端点
await fetch('/api/relation', {
  method: 'POST',
  body: JSON.stringify(relationData)
});
```

#### 新版本（DDD）
```javascript
// 通过Model聚合根操作
import { modelAPI } from './services/api';
await modelAPI.addRelation(relationData);
```

## 迁移步骤

### 步骤1：复制现有代码

```bash
# 复制现有前端代码到frontend_ddd
cp -r frontend/src frontend_ddd/src
# 或手动复制需要的文件
```

### 步骤2：添加API服务层

已创建 `frontend_ddd/src/services/api.js`，包含所有API调用封装。

### 步骤3：更新组件

#### 3.1 ModelDetail组件

**旧代码**：
```javascript
useEffect(() => {
  fetch(`/api/model/${modelId}`)
    .then(r => r.json())
    .then(model => setModel(model));
  
  fetch(`/api/property?modelId=${modelId}`)
    .then(r => r.json())
    .then(props => setProperties(props));
  
  fetch(`/api/relation?modelId=${modelId}`)
    .then(r => r.json())
    .then(rels => setRelations(rels));
}, [modelId]);
```

**新代码**：
```javascript
import { modelAPI } from '../../services/api';

useEffect(() => {
  const loadData = async () => {
    const { model, properties, relations } = await modelAPI.getById(modelId);
    setModel(model);
    setProperties(properties);
    setRelations(relations);
  };
  loadData();
}, [modelId]);
```

#### 3.2 PropertyManager组件

**旧代码**：
```javascript
const handleCreateProperty = () => {
  fetch('/api/property', {
    method: 'POST',
    body: JSON.stringify(propertyData)
  })
    .then(r => r.json())
    .then(property => {
      setProperties([...properties, property]);
    });
};
```

**新代码**：
```javascript
import { modelAPI } from '../../../services/api';

const handleCreateProperty = async () => {
  const newProperty = await modelAPI.addProperty(model.id, propertyData);
  setProperties([...properties, newProperty]);
  
  // 可选：刷新完整数据
  const { properties: updatedProps } = await modelAPI.getById(model.id);
  setProperties(updatedProps);
};
```

### 步骤4：更新所有API调用

使用查找替换功能，将：
- `fetch('/api/model` → `modelAPI.`
- `fetch('/api/property` → `modelAPI.addProperty` 或 `modelAPI.removeProperty`
- `fetch('/api/relation` → `modelAPI.addRelation` 或 `modelAPI.removeRelation`
- `fetch('/api/datasource` → `datasourceAPI.`
- `fetch('/api/etl` → `etlAPI.`
- `fetch('/api/domain` → `domainAPI.`

### 步骤5：处理响应格式变化

#### Model详情响应

**旧格式**：
```javascript
// 分别返回
model: {...}
properties: [...]
relations: [...]
```

**新格式**：
```javascript
// 一次返回
{
  model: {...},
  properties: [...],
  relations: [...]
}
```

#### Model列表响应

**旧格式**：
```javascript
// 可能是数组或对象
models: [...]
```

**新格式**：
```javascript
// 统一格式
{
  models: [...],
  edges: [...]
}
```

## 示例：完整迁移

### ModelDetail组件迁移示例

已创建适配后的组件：
- `frontend_ddd/src/pages/ModelDetail/ModelDetail.jsx`
- `frontend_ddd/src/pages/ModelDetail/modules/PropertyManager.jsx`
- `frontend_ddd/src/pages/ModelDetail/modules/RelationManager.jsx`

### DomainWorkbench组件迁移示例

已创建适配后的组件：
- `frontend_ddd/src/pages/DomainWorkbench/DomainWorkbench.jsx`

## 注意事项

### 1. 错误处理

新API使用统一的错误处理：
```javascript
try {
  const data = await modelAPI.getById(id);
} catch (error) {
  console.error('API error:', error);
  // 显示错误消息给用户
}
```

### 2. 数据刷新

由于新API通过聚合根操作，建议在操作后刷新完整数据：
```javascript
// 添加Property后
await modelAPI.addProperty(modelId, propertyData);
// 刷新完整数据
const { properties } = await modelAPI.getById(modelId);
setProperties(properties);
```

### 3. 向后兼容

如果某些API端点暂时不可用，可以：
1. 保持旧代码作为fallback
2. 逐步迁移组件
3. 使用特性标志控制

## 测试清单

迁移后需要测试：

- [ ] Model列表显示正常
- [ ] Model详情显示正常（包含properties和relations）
- [ ] 添加Property功能正常
- [ ] 删除Property功能正常
- [ ] 添加Relation功能正常
- [ ] 删除Relation功能正常
- [ ] Datasource列表显示正常
- [ ] Datasource详情显示正常
- [ ] ETL任务列表显示正常
- [ ] 所有错误处理正常

## 常见问题

### Q: 如何处理Property更新？

A: 新API可能不支持直接更新Property，需要：
1. 删除旧Property
2. 创建新Property

或者等待后端添加更新端点。

### Q: 如何处理Relation更新？

A: 类似Property，可能需要删除后重新创建。

### Q: 如何处理分页？

A: 新API目前可能不支持分页，需要在客户端实现分页逻辑。

## 下一步

1. 复制现有组件到 `frontend_ddd/src`
2. 逐步更新组件使用新的API服务
3. 测试所有功能
4. 更新文档

