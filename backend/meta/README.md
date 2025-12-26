# 领域模型实体定义

本目录包含业务建模平台的所有领域模型实体定义。

## 核心概念

### Model + Properties = 数据原型（Schema）

**Model** 和 **Properties** 共同定义了数据模型的结构，这是一个**原型（Prototype）**或**模式（Schema）**：

- **Model** = 类定义（Class/Schema）
  - 定义了模型的名称、代码、描述等元信息
  - 相当于数据库表定义

- **Properties** = 字段定义（Fields）
  - 定义了模型的属性（字段）
  - 包含数据类型、约束、验证规则等
  - 相当于数据库表的列定义

- **DataRecord** = 实例（Instance/Row）
  - 根据Model和Properties定义的原型创建的实际数据
  - 相当于数据库表中的数据行

### 关系示例

```
Model: "用户模型" (code: "user")
├── Property: "用户名" (code: "username", type: "string", required: true)
├── Property: "年龄" (code: "age", type: "integer", required: false)
└── Property: "邮箱" (code: "email", type: "string", required: true)

↓ 根据这个原型创建实例

DataRecord (modelId: 1)
├── data: {
│   "username": "张三",
│   "age": 25,
│   "email": "zhangsan@example.com"
│ }
```

## 实体列表

### 核心实体

1. **Domain** (`domain.py`) - 业务域
   - 作为分类/组织维度，不是聚合根
   - 其他实体可以独立于Domain存在

2. **Model** (`model.py`) - 模型（原型定义）
   - 核心业务实体，可以独立存在
   - `domainId` 为可选字段，用于分类
   - **与Properties一起定义数据原型**

3. **Property** (`property.py`) - 属性（字段定义）
   - 必须属于某个Model
   - 包含数据类型、约束、敏感度等信息
   - **与Model一起定义数据原型**

4. **DataRecord** (`data_record.py`) - 数据记录（实例）
   - Model的实例
   - 根据Model和Properties定义的原型创建
   - 包含实际的数据值

5. **Relation** (`relation.py`) - 关系
   - 连接两个Model
   - 不依赖Domain

### 域级别资源

6. **SharedAttribute** (`shared_attribute.py`) - 共享属性
   - 域级别的共享资源
   - 可被多个Model引用

7. **Indicator** (`indicator.py`) - 语义指标
   - 域级别的语义指标
   - 支持发布/下线状态管理

8. **Function** (`function.py`) - 函数
   - 域级别的可复用函数
   - 包含输入输出Schema

### 数据源相关

9. **Datasource** (`datasource.py`) - 数据源
   - 可独立存在
   - 可关联Model和Domain（可选）

10. **Mapping** (`mapping.py`) - 字段映射
    - 连接Datasource、Model和Property

11. **ModelTableAssociation** (`model_table_association.py`) - 模型表关联
    - 连接Model和Datasource的表

### 动作和ETL

12. **ActionType** (`action_type.py`) - 动作类型
    - 关联到Model
    - 不依赖Domain

13. **ETLTask** (`etl_task.py`) - ETL任务
    - 连接Datasource和Model
    - 不依赖Domain
    - 支持状态管理（inactive, active, running, paused, error）

14. **ETLLog** (`etl_log.py`) - ETL日志
    - 属于ETLTask
    - 记录执行结果和统计信息

## 使用示例

### 创建数据原型（Model + Properties）

```python
from meta import Model, Property

# 1. 创建模型（原型定义）
model = Model(
    id=1,
    name="用户模型",
    code="user",
    description="用户业务模型",
    domainId=1
)

# 2. 创建属性（字段定义）
properties = [
    Property(
        id=1,
        name="用户名",
        code="username",
        type="string",
        modelId=1,
        required=True
    ),
    Property(
        id=2,
        name="年龄",
        code="age",
        type="integer",
        modelId=1,
        required=False
    )
]

# Model + Properties = 数据原型（Schema）
```

### 根据原型创建实例（DataRecord）

```python
from meta import DataRecord

# 根据Model和Properties定义的原型创建数据记录
record = DataRecord(
    id=1,
    modelId=1,  # 关联到Model原型
    data={
        "username": "张三",  # 对应Property code="username"
        "age": 25           # 对应Property code="age"
    }
)

# 验证数据是否符合原型定义
is_valid, errors = record.validate_against_properties(properties)
if not is_valid:
    print("验证失败:", errors)
```

## 设计原则

1. **原型-实例模式**：Model + Properties 定义原型，DataRecord 是实例
2. **独立性**：大部分实体可以独立存在，不强制依赖Domain
3. **可选关联**：Domain作为可选的分类维度
4. **领域方法**：实体包含业务方法（如状态切换、发布、验证等）
5. **序列化支持**：所有实体支持`to_dict()`和`from_dict()`

## 实体关系

```
Model (原型定义)
├── Property (字段定义)
└── DataRecord (实例)
    └── 根据Model和Properties创建

Domain (分类维度)
├── SharedAttribute (域级别)
├── Indicator (域级别)
└── Function (域级别)
```