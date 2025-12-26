# 架构说明

## 三层架构

项目采用经典的三层架构设计：

```
API层 (routes/)
  ↓
Service层 (service/)
  ↓
Repository层 (repository/)
  ↓
Meta层 (meta/) - 领域模型实体
```

## 目录结构

### 1. Meta层 (`backend/meta/`)
领域模型实体定义，包含：
- 实体类定义
- `to_dict()` / `from_dict()` 序列化方法
- 业务方法（如状态切换、发布等）

### 2. Repository层 (`backend/repository/`)
持久化层，负责数据库操作：
- `BaseRepository` - 基础Repository类，提供通用CRUD操作
- 各实体的Repository - 实现具体的数据库操作
- 支持复杂查询（如按domainId、modelId查询）

### 3. Service层 (`backend/service/`)
业务逻辑层，负责：
- 业务规则验证
- 实体之间的协调
- 调用Repository进行数据操作
- 提供业务方法（如发布指标、测试连接等）

### 4. API层 (`backend/routes/`)
HTTP接口层，负责：
- 接收HTTP请求
- 参数验证
- 调用Service层
- 返回JSON响应

## 使用示例

### 创建模型

```python
# API层
@model_bp.route('', methods=['POST'])
def create_model():
    data = request.get_json()
    model = service.create(data)  # 调用Service
    return jsonify(model.to_dict()), 201

# Service层
def create(self, data: dict) -> Model:
    model = Model.from_dict({...})  # 使用Meta实体
    return self.repository.create(model)  # 调用Repository

# Repository层
def create(self, entity: Model) -> Model:
    # 数据库操作
    conn.execute("INSERT INTO models ...")
    return entity
```

## 优势

1. **职责分离**：每层职责清晰
2. **易于测试**：可以单独测试Service和Repository
3. **易于维护**：修改数据库结构只需修改Repository
4. **代码复用**：BaseRepository提供通用方法
5. **类型安全**：使用Meta实体确保类型一致

## 实体关系

- Model可以独立存在
- Property必须属于Model
- Relation连接两个Model
- Domain作为可选分类维度
- 其他实体可以独立或关联Domain/Model
