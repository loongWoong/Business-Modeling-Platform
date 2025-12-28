# 元模型设计文档

## 概述

元模型（Meta Model）是业务建模平台的核心抽象层，参考Palantir的本体论思想构建。元模型定义了描述业务领域概念的结构化模型，包括模型定义、属性约束、关系配置等元数据，为数据治理和业务建模提供统一的概念框架。

元模型与业务建模领域的关系体现在三个层面：首先是领域抽象层，元模型将业务概念抽象为结构化的元数据，使得业务人员和技术人员能够使用统一的语言沟通业务需求；其次是数据治理层，通过元模型定义的属性约束和关系规则，系统能够自动验证数据质量、追踪数据血缘、执行数据标准化；最后是应用驱动层，元模型作为系统的"蓝图"，驱动数据同步、ETL处理、API生成等下游应用的自动实现。

## 核心实体

### MetaModel（元模型）

MetaModel是元模型系统的核心实体，代表一个业务概念的定义。每个MetaModel对应业务领域中的一个核心实体，如"用户"、"订单"、"商品"等。MetaModel本身是一个概念容器，包含模型的基本信息和一组属性及关系的定义。

MetaModel的核心属性包括：code作为模型的唯一标识符，必须以字母开头，只能包含字母、数字和下划线，用于在系统内部唯一定位模型；name是人类可读的模型名称，展示给业务用户；description提供模型的详细说明，描述模型的业务含义和用途；category用于模型的分类，便于组织和检索；type标识模型的元类型，可能的值包括实体类型、枚举类型、服务类型等；properties列表包含模型的所有属性定义；relations列表包含模型与其他模型的关系定义；metadata提供扩展属性存储，用于保存与特定业务场景相关的额外信息。

MetaModel提供的关键方法包括：isValid()用于验证模型的合法性，检查code是否满足命名规范；getProperty(code)用于根据属性编码查询属性定义；hasProperty(code)用于检查模型是否包含指定属性；addProperty(property)和addRelation(relation)用于动态添加属性和关系定义。

### MetaProperty（元属性）

MetaProperty定义MetaModel的具体属性特征，是元模型系统中描述数据结构和数据约束的核心组件。每个MetaProperty对应业务模型中的一个字段或属性，如用户的"用户名"、"邮箱"、"手机号"等。MetaProperty不仅定义属性的基本信息，还包含丰富的数据验证规则。

MetaProperty的核心属性包括：code是属性的唯一标识符，采用"模型编码.属性编码"的格式在全局范围内唯一标识一个属性；name是人类可读的属性名称，展示给业务用户；type标识属性的数据类型，支持STRING、INTEGER、LONG、DOUBLE、BOOLEAN、DATE、DATETIME、TEXT、JSON、ENUM等类型；required标识属性是否为必填项；unique标识属性值是否需要全局唯一；defaultValue提供属性的默认值；description提供属性的详细说明；minLength和maxLength分别定义字符串类型属性的最小和最大长度限制；pattern使用正则表达式定义属性的格式约束；constraints提供可扩展的约束配置Map，用于保存复杂的业务规则；sensitivityLevel标识属性的敏感级别，用于数据脱敏策略；maskRule定义属性的脱敏规则，如手机号的中间四位掩码。

MetaProperty提供的关键方法包括：validate(value)用于根据属性定义验证给定的值是否满足所有约束条件；isCompatibleWith(other)用于检查两个属性是否类型兼容，常用于数据映射和转换场景；createStringProperty、createLongProperty、createBooleanProperty等静态工厂方法提供快速创建常用类型属性的便捷方式。

### MetaRelation（元关系）

MetaRelation定义MetaModel之间的关系结构，是元模型系统中描述业务实体间关联的核心组件。每个MetaRelation描述两个模型之间的业务关系，如用户与角色的"所属"关系、订单与商品的"包含"关系等。MetaRelation支持多种关系类型，能够准确表达复杂的业务关联语义。

MetaRelation的核心属性包括：code是关系的唯一标识符，在源模型范围内唯一；name是人类可读的关系名称，展示给业务用户；sourceModelCode标识关系源端模型的编码，即关系的发起方；targetModelCode标识关系目标端模型的编码，即关系的接收方；type定义关系的类型，支持ONE_TO_ONE（一对一）、ONE_TO_MANY（一对多）、MANY_TO_ONE（多对一）、MANY_TO_MANY（多对多）等类型；bidirectional标识关系是否为双向的，双向关系在图谱展示时更直观；description提供关系的详细说明；metadata提供扩展属性存储。

MetaRelation提供的关键方法包括：involvesModel(modelCode)用于检查关系是否涉及指定的模型；isValid()用于验证关系的合法性，要求源模型和目标模型编码均不能为空。

### MetaDomain（元领域）

MetaDomain是对业务领域的高层抽象，代表业务系统中的一个主要业务分区或业务模块。每个MetaDomain对应业务中的一个高阶概念，如"用户管理"、"订单管理"、"库存管理"等。MetaDomain用于组织和分组相关的业务模型，使大型业务系统的结构更加清晰。

MetaDomain的核心属性包括：code是领域的唯一标识符；name是人类可读的领域名称；description提供领域的详细说明，描述领域的业务边界和核心职责；owner标识领域的负责人或负责团队；active标识领域是否处于激活状态，非激活领域下的模型可能不会被纳入某些业务流程。

MetaDomain与MetaModel的关系是一对多关系：一个业务领域可以包含多个业务模型，而每个业务模型有且仅属于一个业务领域。这种关系反映了业务系统的层次结构：领域层提供高层的业务分区，模型层提供细粒度的业务概念定义。

### MetaDatasource（元数据源）

MetaDatasource定义外部数据源的元信息，是元模型系统中描述数据连接和数据获取方式的核心组件。每个MetaDatasource对应一个具体的数据源连接配置，如MySQL数据库连接、API接口配置、文件系统路径等。MetaDatasource为ETL任务和数据同步提供必要的数据源信息。

MetaDatasource的核心属性包括：code是数据源的唯一标识符；name是人类可读的数据源名称；description提供数据源的详细说明；type标识数据源的类型，如MYSQL、POSTGRESQL、ORACLE、REST_API、CSV等；urlTemplate定义数据源的连接URL模板，支持参数化配置；driverClassName指定JDBC驱动类名（针对关系型数据库）；requiresCredentials标识数据源是否需要用户名密码认证；supportsBatch标识数据源是否支持批量操作。

MetaDatasource与MetaModel的关系是可选的一对多关系：一个数据源可以与多个业务模型关联，表示这些模型的数据来源于该数据源；同时一个业务模型也可以关联多个数据源，表示模型数据可以从多个来源同步或聚合。

## 辅助实体

### RelationType（关系类型枚举）

RelationType定义元模型系统中支持的关系类型常量，包括ONE_TO_ONE（一对一）、ONE_TO_MANY（一对多）、MANY_TO_ONE（多对一）、MANY_TO_MANY（多对多）四种基本类型。关系类型决定了关系在数据库层面的外键约束设计和应用层面的级联行为配置。

### DatasourceType（数据源类型枚举）

DatasourceType定义支持的数据源类型常量，覆盖常见的关系型数据库（MYSQL、POSTGRESQL、ORACLE、SQLSERVER）、文件类型（CSV、JSON、EXCEL）、API类型（REST_API、GRAPH_QL）以及大数据平台（HIVE、SPARK）。新的数据源类型可以通过扩展此枚举来支持。

### SensitivityLevel（敏感级别枚举）

SensitivityLevel定义数据敏感级别常量，用于标识属性的敏感程度，支持PUBLIC（公开）、INTERNAL（内部）、CONFIDENTIAL（机密）、RESTRICTED（绝密）四个级别。敏感级别与脱敏规则配合使用，实现细粒度的数据保护策略。

### MetaType（元类型枚举）

MetaType定义元模型的类型常量，包括ENTITY（实体类型，对应业务中的具体对象）、ENUM（枚举类型，对应业务中的有限取值集合）、SERVICE（服务类型，对应业务中的服务定义）、EVENT（事件类型，对应业务中的事件定义）。元类型帮助系统识别模型的不同用途并应用不同的处理逻辑。

### MetaConstants（元常量类）

MetaConstants定义系统中使用的常量值，包括默认数据类型列表、默认关系类型列表、敏感级别映射、常用约束配置等。集中管理常量有助于保持代码的一致性和可维护性。

### MetaETLTask（元ETL任务）

MetaETLTask定义ETL任务的元信息，包括任务名称、源数据源、目标模型、转换规则等配置。ETL任务元信息与元模型配合使用，实现从源系统到目标模型的数据同步和转换。

### MetaMapping（元映射）

MetaMapping定义数据字段与模型属性之间的映射关系，包括源字段、目标属性、数据转换规则等配置。Mapping是ETL处理的核心配置，决定了数据如何从源格式转换到目标格式。

## 元注册中心（MetaRegistry）

MetaRegistry是元模型系统的核心注册中心组件，负责管理所有元模型实体的注册、查询和生命周期管理。MetaRegistry采用单例模式设计，通过Spring组件管理，确保在应用上下文中的唯一性和全局可访问性。

MetaRegistry内部维护三个核心存储结构：models存储所有注册的MetaModel，以模型编码为键；properties存储所有注册的MetaProperty，以"模型编码.属性编码"为键；relations存储所有注册的MetaRelation，以"模型编码.关系编码"为键。这三个存储结构均使用ConcurrentHashMap实现，保证并发访问的线程安全性。

MetaRegistry提供的核心方法包括：register(metaModel)用于注册一个新的元模型，同时自动注册模型下的所有属性和关系；getModel(code)用于根据模型编码查询元模型；getAllModels()用于获取所有已注册的元模型；getPropertiesForModel(modelCode)用于获取指定模型的所有属性；getRelationsForModel(modelCode)用于获取涉及指定模型的所有关系；getProperty(modelCode, propertyCode)用于精确查询指定模型的指定属性；clear()用于清空所有注册信息，通常在缓存刷新场景使用；getModelCount()和getPropertyCount()提供统计信息。

MetaRegistry在注册过程中的验证机制确保了元模型的完整性：模型编码不能为空且必须唯一；属性编码在全局范围内必须唯一；关系编码在模型范围内必须唯一。这些验证防止了元数据的冲突和歧义。

## 实体关系图

元模型系统中的实体关系可以从静态结构和动态关联两个视角来理解。

在静态结构视角下，核心实体形成以下层次关系：MetaDomain位于最顶层，代表业务领域；MetaModel作为业务概念的核心定义，属于某个MetaDomain，包含多个MetaProperty和MetaRelation；MetaProperty描述模型的属性特征，每个属性属于且仅属于一个模型；MetaRelation描述模型间的关系，连接两个不同的模型。这种层次结构反映了业务系统的组织规律：领域包含模型，模型包含属性，属性描述特征，关系连接模型。

在动态关联视角下，各实体之间存在以下关联路径：MetaModel通过MetaProperty与具体数据字段关联，实现元数据到数据的映射；MetaModel通过MetaRelation与其他MetaModel关联，形成业务关系网络；MetaModel通过MetaDatasource与外部数据源关联，实现元数据到数据源的映射；MetaDomain通过归属关系与MetaModel关联，实现业务分区；MetaDatasource通过数据获取配置与外部系统关联，实现数据集成。

## 与业务建模领域的映射

元模型系统与业务建模领域之间存在精确的概念映射关系，这种映射是元模型驱动业务应用的基础。

在概念层面，MetaModel对应业务概念中的"实体"或"对象"，如客户、产品、订单等业务名词；MetaProperty对应业务概念中的"属性"或"字段"，如客户姓名、产品价格、订单日期等业务特征；MetaRelation对应业务概念中的"关系"或"关联"，如客户下订单、产品属于分类等业务联系；MetaDomain对应业务概念中的"领域"或"模块"，如销售领域、库存领域等业务分区。

在数据治理层面，元模型驱动以下治理活动的自动化实现：数据验证方面，根据MetaProperty定义的约束规则自动验证入库数据；数据血缘方面，根据MetaRelation追踪数据的来源和流向；数据脱敏方面，根据SensitivityLevel和MaskRule自动应用脱敏策略；数据标准化方面，根据MetaProperty的类型定义自动执行格式转换。

在应用生成层面，元模型驱动以下应用的自动生成：API生成方面，根据MetaModel和MetaProperty自动生成RESTful API；文档生成方面，根据元数据自动生成数据字典和API文档；代码生成方面，根据元模型自动生成实体类、DTO、数据访问层代码；ETL配置方面，根据MetaMapping和MetaRelation自动生成数据同步配置。

## 使用场景

元模型系统在以下业务场景中发挥核心作用。

在数据目录和数据字典场景中，MetaModel和MetaProperty提供完整的元数据目录，支持业务用户查询和理解数据资产。数据分析师可以通过浏览元模型了解企业的数据资产分布，通过属性定义理解字段的业务含义。

在数据质量监控场景中，MetaProperty的约束规则为数据质量检查提供判断依据。系统可以根据必填性、唯一性、格式规则等约束自动检测数据质量问题，生成质量报告和改进建议。

在数据集成和数据同步场景中，MetaDatasource和MetaMapping配置数据源连接和字段映射，MetaRelation定义模型间的关联关系。这些元数据共同指导ETL作业的配置和执行，实现跨系统的数据集成。

在API服务发布场景中，MetaModel定义服务的输入输出数据结构，MetaProperty定义字段的验证规则和格式化要求。API框架可以根据元数据自动生成接口文档、参数校验逻辑和响应格式化代码。

在数据安全管控场景中，SensitivityLevel和MaskRule为数据访问控制和数据脱敏提供配置依据。安全系统可以根据敏感级别决定用户的数据访问权限，根据脱敏规则自动处理敏感信息的展示。
