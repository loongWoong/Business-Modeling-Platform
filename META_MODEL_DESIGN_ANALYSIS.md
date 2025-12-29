# 元模型设计分析报告

## 1. 设计概述

本项目采用**元模型驱动架构（Meta-Model Driven Architecture）**，参考Palantir本体论思想，构建了一个业务建模平台的核心抽象层。元模型系统定义了描述业务领域概念的结构化模型，包括模型定义、属性约束、关系配置等元数据。

### 1.1 核心设计理念

- **自描述性（Self-Describing）**：元模型本身也由元模型定义（通过`MetaModelFactory`创建）
- **领域驱动设计（DDD）**：采用领域驱动设计思想，将业务概念抽象为元数据
- **元数据驱动应用**：元模型作为"蓝图"，驱动数据验证、ETL、API生成等下游应用
- **分层抽象**：领域 → 模型 → 属性/关系，形成清晰的层次结构

## 2. 核心实体架构

### 2.1 实体层次结构

```
MetaDomain (领域层)
    └── MetaModel (模型层)
        ├── MetaProperty (属性)
        └── MetaRelation (关系)
    
MetaDatasource (数据源)
    └── MetaMapping (映射关系)
    
MetaETLTask (ETL任务)
```

### 2.2 核心实体详解

#### 2.2.1 MetaModel（元模型）

**位置**：`com.jianmo.platform.meta.MetaModel`

**职责**：代表一个业务概念的定义，是元模型系统的核心容器。

**关键属性**：
- `code`: 唯一标识符（字母开头，字母数字下划线）
- `name`: 人类可读名称
- `type`: 元类型（`MetaType`枚举：AGGREGATE_ROOT, ENTITY, VALUE_OBJECT等）
- `properties`: 属性列表（`List<MetaProperty>`）
- `relations`: 关系列表（`List<MetaRelation>`）
- `metadata`: 扩展属性（`Map<String, Object>`）

**关键方法**：
```java
boolean isValid()                    // 验证模型合法性（code格式）
Optional<MetaProperty> getProperty(String code)  // 查询属性
boolean hasProperty(String code)     // 检查属性是否存在
void addProperty(MetaProperty)       // 动态添加属性
void addRelation(MetaRelation)       // 动态添加关系
```

**设计特点**：
- 支持动态添加属性和关系
- 提供属性查询和验证功能
- 使用Optional处理空值

#### 2.2.2 MetaProperty（元属性）

**位置**：`com.jianmo.platform.meta.MetaProperty`

**职责**：定义模型的具体属性特征和数据约束。

**关键属性**：
- `code`: 属性编码（全局唯一，格式：`modelCode.propertyCode`）
- `type`: 数据类型（STRING, INTEGER, LONG, DOUBLE, BOOLEAN, DATE, DATETIME, TEXT, JSON, ENUM）
- `required`: 是否必填
- `unique`: 是否唯一
- `minLength` / `maxLength`: 字符串长度约束
- `pattern`: 正则表达式格式约束
- `sensitivityLevel`: 敏感级别（`SensitivityLevel`枚举）
- `maskRule`: 脱敏规则

**关键方法**：
```java
boolean validate(Object value)                    // 验证属性值
boolean isCompatibleWith(MetaProperty other)      // 类型兼容性检查
static MetaProperty createStringProperty(...)     // 工厂方法
static MetaProperty createLongProperty(...)
static MetaProperty createBooleanProperty(...)
```

**设计特点**：
- 丰富的验证规则（长度、格式、必填）
- 支持数据脱敏（敏感级别+脱敏规则）
- 提供静态工厂方法简化创建

#### 2.2.3 MetaRelation（元关系）

**位置**：`com.jianmo.platform.meta.MetaRelation`

**职责**：定义模型之间的关系结构。

**关键属性**：
- `code`: 关系编码（在源模型范围内唯一）
- `sourceModelCode`: 源模型编码
- `targetModelCode`: 目标模型编码
- `type`: 关系类型（`RelationType`枚举：ONE_TO_ONE, ONE_TO_MANY, MANY_TO_ONE, MANY_TO_MANY）
- `bidirectional`: 是否双向关系

**关键方法**：
```java
boolean involvesModel(String modelCode)  // 检查关系是否涉及指定模型
boolean isValid()                        // 验证关系合法性
```

**设计特点**：
- 支持多种关系类型（一对一、一对多、多对多）
- 支持双向关系定义
- 通过模型编码关联，而非ID，提高灵活性

#### 2.2.4 MetaDomain（元领域）

**位置**：`com.jianmo.platform.meta.MetaDomain`

**职责**：对业务领域的高层抽象，组织和分组相关业务模型。

**关键属性**：
- `code`: 领域编码
- `name`: 领域名称
- `owner`: 负责人
- `active`: 是否激活

**与数据库映射**：对应`domains`表，支持`domain_type`（category/workspace）和`workspace_config`等扩展字段。

#### 2.2.5 MetaDatasource（元数据源）

**位置**：`com.jianmo.platform.meta.MetaDatasource`

**职责**：定义外部数据源的元信息。

**关键属性**：
- `type`: 数据源类型（`DatasourceType`枚举：MYSQL, POSTGRESQL, SQLSERVER, DUCKDB）
- `urlTemplate`: 连接URL模板
- `driverClassName`: JDBC驱动类名
- `requiresCredentials`: 是否需要认证
- `supportsBatch`: 是否支持批量操作

**设计特点**：
- 通过枚举封装数据库驱动信息
- 支持多种数据源类型扩展

## 3. 支撑组件设计

### 3.1 MetaRegistry（元注册中心）

**位置**：`com.jianmo.platform.meta.registry.MetaRegistry`

**设计模式**：注册中心模式 + 单例模式（Spring Component）

**核心存储结构**：
```java
private final Map<String, MetaModel> models = new ConcurrentHashMap<>();
private final Map<String, MetaProperty> properties = new ConcurrentHashMap<>();
private final Map<String, MetaRelation> relations = new ConcurrentHashMap<>();
```

**关键设计**：
- 使用`ConcurrentHashMap`保证线程安全
- 属性全局唯一键：`modelCode.propertyCode`
- 关系全局唯一键：`modelCode.relationCode`
- 注册时自动验证（编码唯一性、格式合法性）

**核心方法**：
```java
void register(MetaModel)                           // 注册元模型（级联注册属性和关系）
Optional<MetaModel> getModel(String code)          // 查询模型
List<MetaProperty> getPropertiesForModel(String)   // 查询模型的所有属性
List<MetaRelation> getRelationsForModel(String)    // 查询涉及模型的所有关系
Optional<MetaProperty> getProperty(String, String) // 精确查询属性
void clear()                                       // 清空注册信息
```

**设计特点**：
- 内存存储，查询效率高
- 支持并发访问
- 注册时级联处理属性和关系

### 3.2 MetaModelValidator（元模型验证器）

**位置**：`com.jianmo.platform.meta.validation.MetaModelValidator`

**职责**：提供元模型的验证功能。

**验证能力**：
1. **模型验证**：名称、编码格式、编码唯一性
2. **属性验证**：名称、编码格式、类型有效性
3. **关系验证**：源模型和目标模型不能为空且不能相同
4. **数据验证**：根据元模型定义验证实际数据

**核心方法**：
```java
ValidationResult validateModelCreate(String name, String code)
ValidationResult validatePropertyCreate(String name, String code, String type)
ValidationResult validateRelationCreate(Long sourceModelId, Long targetModelId)
ValidationResult validateDataAgainstMeta(String modelCode, Map<String, Object> data)
```

**设计特点**：
- 统一的验证结果封装（`ValidationResult`）
- 支持类型白名单验证
- 可以基于元模型验证实际数据

### 3.3 MetaModelFactory（元模型工厂）

**位置**：`com.jianmo.platform.meta.factory.MetaModelFactory`

**设计模式**：工厂模式

**职责**：创建系统内置的元模型定义（元模型的元模型）。

**支持的元模型**：
- `model`: 业务模型元模型
- `property`: 模型属性元模型
- `datasource`: 数据源元模型
- `etl_task`: ETL任务元模型
- `domain`: 领域元模型
- `mapping`: 字段映射元模型
- `relation`: 关系元模型
- `shared_attribute`: 共享属性元模型（语义层）
- `indicator`: 指标元模型（语义层）
- `function`: 函数元模型（语义层）
- `data_lineage`: 数据血缘元模型

**设计特点**：
- 实现自描述性：元模型本身也由元模型定义
- 统一使用工厂方法`createProperty`创建属性，保持一致性

## 4. 枚举类型设计

### 4.1 RelationType（关系类型）

```java
ONE_TO_ONE("one-to-one")
ONE_TO_MANY("one-to-many")
MANY_TO_ONE("many-to-one")
MANY_TO_MANY("many-to-many")
```

**特点**：支持字符串值和枚举值之间的转换（`fromValue`方法）。

### 4.2 DatasourceType（数据源类型）

```java
MYSQL("mysql", "com.mysql.cj.jdbc.Driver", "jdbc:mysql://")
POSTGRESQL("postgresql", "org.postgresql.Driver", "jdbc:postgresql://")
SQLSERVER("sqlserver", "com.microsoft.sqlserver.jdbc.SQLServerDriver", "jdbc:sqlserver://")
DUCKDB("duckdb", "org.duckdb.Driver", "jdbc:duckdb:")
```

**特点**：
- 封装驱动类名和URL前缀
- 便于扩展新的数据源类型

### 4.3 SensitivityLevel（敏感级别）

```java
PUBLIC("public")
INTERNAL("internal")
CONFIDENTIAL("confidential")
SECRET("secret")
```

**特点**：
- 用于数据脱敏策略
- `fromValue`方法支持默认值（返回PUBLIC）

### 4.4 MetaType（元类型）

```java
AGGREGATE_ROOT   // 聚合根
ENTITY          // 实体
VALUE_OBJECT    // 值对象
SERVICE         // 服务
FACTORY         // 工厂
REPOSITORY      // 仓储
EVENT           // 事件
```

**特点**：体现DDD思想，区分不同的领域对象类型。

## 5. 与数据库Schema的映射关系

### 5.1 实体映射

| Java元模型类 | 数据库表 | 映射说明 |
|------------|---------|---------|
| `MetaDomain` | `domains` | 一对一映射，Java类简化，数据库表包含更多字段（domain_type, workspace_config等） |
| `MetaModel` | `models` | 一对一映射 |
| `MetaProperty` | `properties` | 一对一映射，数据库表包含更多物理字段（physical_column, foreign_key_table等） |
| `MetaRelation` | `relations` | 一对一映射 |
| `MetaDatasource` | `datasources` | 一对一映射 |
| `MetaMapping` | `mappings` | 一对一映射 |
| `MetaETLTask` | `etl_tasks` | 一对一映射 |

### 5.2 设计差异

**Java元模型层**：
- 偏向于概念抽象，关注业务语义
- 使用内存注册中心（MetaRegistry）
- 支持动态添加属性和关系
- 提供验证和查询能力

**数据库持久化层**：
- 包含更多物理实现细节（如`physical_column`, `foreign_key_table`）
- 支持领域扩展字段（如`domain_type`, `workspace_config`）
- 包含审计字段（`created_at`, `updated_at`）
- 包含状态字段（如`status`, `is_active`）

**设计理念**：Java元模型层关注业务概念，数据库层关注持久化和扩展。

## 6. 设计模式和架构特点

### 6.1 使用的设计模式

1. **注册中心模式（Registry Pattern）**
   - `MetaRegistry`作为全局注册中心
   - 统一管理所有元模型实例

2. **工厂模式（Factory Pattern）**
   - `MetaModelFactory`创建系统内置元模型

3. **验证模式（Validation Pattern）**
   - `MetaModelValidator`集中处理验证逻辑
   - `ValidationResult`封装验证结果

4. **单例模式（Singleton Pattern）**
   - `MetaRegistry`通过Spring Component实现单例

### 6.2 架构特点

1. **分层清晰**
   - 元模型定义层（MetaModel等实体类）
   - 注册管理层（MetaRegistry）
   - 验证层（MetaModelValidator）
   - 工厂层（MetaModelFactory）

2. **扩展性强**
   - 通过`metadata`字段支持扩展属性
   - 枚举类型易于扩展（如DatasourceType）
   - 工厂模式便于添加新的元模型定义

3. **类型安全**
   - 使用枚举类型而非字符串常量
   - Optional处理空值
   - 验证器确保数据合法性

4. **性能优化**
   - 内存注册中心，查询效率高
   - ConcurrentHashMap保证并发性能
   - 使用Map的key设计支持快速查询

## 7. 核心设计亮点

### 7.1 自描述性

通过`MetaModelFactory`，系统可以为自身创建元模型定义，实现自描述。例如：
- `createModelMetaModel()`：创建"模型"的元模型
- `createPropertyMetaModel()`：创建"属性"的元模型

这使得系统可以在运行时理解自己的结构。

### 7.2 全局唯一编码体系

- 模型编码：在全局范围内唯一
- 属性编码：格式为`modelCode.propertyCode`，全局唯一
- 关系编码：格式为`modelCode.relationCode`，在源模型范围内唯一

这种编码体系支持快速查询和避免冲突。

### 7.3 丰富的验证能力

- **结构验证**：编码格式、唯一性
- **数据验证**：基于元模型定义验证实际数据
- **类型验证**：属性类型白名单
- **关系验证**：关系合法性检查

### 7.4 数据安全支持

- **敏感级别**：通过`SensitivityLevel`标识数据敏感程度
- **脱敏规则**：通过`maskRule`定义具体的脱敏方式
- **属性级别控制**：在属性层面定义安全策略

### 7.5 语义层扩展

支持语义层概念：
- **共享属性（Shared Attribute）**：可在多个模型中复用
- **指标（Indicator）**：业务指标定义
- **函数（Function）**：可复用的计算函数
- **数据血缘（Data Lineage）**：追踪数据流向

## 8. 潜在改进方向

### 8.1 持久化支持

当前`MetaRegistry`使用内存存储，可以考虑：
- 持久化到数据库
- 支持缓存刷新机制
- 支持分布式环境下的同步

### 8.2 版本管理

当前设计缺少版本管理：
- 元模型变更历史
- 版本回退能力
- 变更影响分析

### 8.3 更细粒度的验证

可以增强验证能力：
- 自定义验证规则
- 验证规则插件化
- 异步验证支持

### 8.4 关系导航

当前关系查询相对简单，可以增强：
- 关系路径查询（A→B→C）
- 反向关系自动发现
- 关系图谱构建

### 8.5 元模型继承

可以支持：
- 元模型继承/组合
- 属性模板复用
- 关系模式复用

## 9. 总结

本项目元模型设计具有以下优势：

1. **概念清晰**：层次分明，符合DDD思想
2. **扩展性强**：支持多种扩展机制
3. **类型安全**：使用枚举和Optional，减少错误
4. **性能优良**：内存注册中心，查询效率高
5. **功能完整**：涵盖验证、查询、工厂等核心功能

整体设计体现了元模型驱动架构的核心思想，为业务建模平台提供了坚实的抽象基础。
