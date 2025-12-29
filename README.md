# 业务建模平台 (Business-Modeling-Platform)

参考palantir的本体论思想构建的业务建模平台，用于驱动数据治理平台应用。基于React、Ant Design和D3.js的现代化领域驱动设计(DDD)可视化建模工具。

## 功能特性

### 1. 业务域地图 (Domain Map)
- 可视化展示业务域及其相互关系
- D3.js力导向图展示域间关联
- 支持域的创建、编辑、删除等操作
- 支持工作空间（workspace）和分类（category）两种域类型

### 2. 域工作台 (Domain Workbench)
- **模型地图**：D3.js力导向图可视化展示模型及属性关系
- **模型管理**：增删改查模型定义，支持多种元类型（实体、值对象、聚合根等）
- **数据源管理**：配置外部数据源连接（MySQL、PostgreSQL、DuckDB等）
- **共享属性**：定义可在多个模型中复用的属性（语义层）
- **关系管理**：配置模型间的各种关系（一对一、一对多、多对多）
- **语义层**：
  - 指标定义：定义业务指标和计算表达式
  - 函数定义：定义可复用的计算函数
- **可视化图表**：ER图和UML图可视化展示

### 3. 模型详情 (Model Detail)
- **属性管理**：定义模型的具体属性，支持数据类型、约束、敏感级别等
- **关系配置**：查看和配置模型间的关系
- **数据源关联**：关联数据源和表，配置字段映射
- **数据浏览**：查看实际数据记录
- **ETL任务**：配置和管理ETL任务，查看执行日志
- **语义指标**：绑定和管理模型相关的语义指标
- **数据血缘**：可视化展示数据血缘关系（正向、反向、端到端）

### 4. 元模型系统
- **元模型注册中心**：统一管理所有元模型实体
- **元模型验证**：支持模型、属性、关系的验证
- **元模型工厂**：提供元模型创建工厂方法
- 参考Palantir本体论思想构建，支持自描述元模型

## 技术栈

### 前端
- **框架**: React 18 + Vite
- **UI组件库**: Ant Design 6
- **图表库**: D3.js v7
- **路由**: React Router v6
- **样式**: CSS3 Variables, Flexbox, Grid

### 后端 (Java)
- **框架**: Spring Boot 2.7.18
- **JDK版本**: 1.8
- **数据库**: H2 File Database
- **ORM**: Hibernate 5.6 + Spring Data JPA
- **API文档**: Springdoc OpenAPI 1.6.15

### 后端 (Python DDD)
- **框架**: Flask
- **Python版本**: 3.10+
- **架构**: 领域驱动设计（DDD）
- **数据库**: DuckDB

## 环境要求

| 组件 | 版本要求 |
|------|----------|
| Node.js | 16+ |
| npm | 8+ |
| JDK | 1.8 |
| Maven | 3.6+ |
| Python | 3.10+ |

## 项目结构

```
trae-build-demo-qoder/
├── frontend/                      # 前端项目 (React)
│   ├── src/
│   │   ├── components/            # 通用组件
│   │   │   ├── NavigationMenu.jsx # 导航菜单
│   │   │   ├── Pagination.jsx     # 分页组件
│   │   │   ├── PermissionBadge.jsx # 权限标识
│   │   │   └── WorkspaceSwitcher.jsx # 工作空间切换器
│   │   ├── pages/                 # 页面组件
│   │   │   ├── DomainMap/         # 业务域地图
│   │   │   ├── DomainWorkbench/   # 域工作台
│   │   │   ├── DomainManager/     # 领域管理
│   │   │   ├── ModelDetail/       # 模型详情
│   │   │   ├── ModelsPage/        # 模型列表页
│   │   │   ├── DatasourceDetail/  # 数据源详情
│   │   │   ├── DatasourcesPage/   # 数据源列表页
│   │   │   ├── ETLManager/        # ETL管理
│   │   │   ├── MappingManager/    # 映射管理
│   │   │   └── RelationManager/   # 关系管理
│   │   ├── services/
│   │   │   └── api.js             # API服务层
│   │   ├── hooks/
│   │   │   └── usePermission.js   # 权限Hook
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend_java/                  # 后端服务 (Java)
│   ├── src/main/java/
│   │   └── com/jianmo/platform/
│   │       ├── config/            # 配置类
│   │       │   ├── CorsConfig.java
│   │       │   ├── SwaggerConfig.java
│   │       │   └── ...
│   │       ├── controller/        # REST API控制器
│   │       │   ├── DomainController.java
│   │       │   ├── ModelController.java
│   │       │   ├── DatasourceController.java
│   │       │   └── ...
│   │       ├── dto/               # 数据传输对象
│   │       │   ├── request/       # 请求DTO
│   │       │   └── response/      # 响应DTO
│   │       ├── entity/            # 实体类（JPA实体）
│   │       │   ├── Domain.java
│   │       │   ├── Model.java
│   │       │   ├── Property.java
│   │       │   └── ...
│   │       ├── meta/              # 元模型定义
│   │       │   ├── MetaModel.java
│   │       │   ├── MetaProperty.java
│   │       │   ├── MetaRelation.java
│   │       │   ├── registry/      # 元注册中心
│   │       │   ├── factory/       # 元模型工厂
│   │       │   └── validation/    # 元模型验证
│   │       ├── repository/        # 数据访问层（JPA Repository）
│   │       ├── service/           # 业务逻辑层
│   │       │   └── impl/          # 服务实现
│   │       ├── common/            # 通用类
│   │       │   ├── Result.java    # 统一响应格式
│   │       │   ├── PageResult.java
│   │       │   └── exception/     # 异常处理
│   │       └── utils/             # 工具类
│   ├── src/main/resources/
│   │   ├── application.yml        # 应用配置
│   │   └── db/init/               # 数据库初始化脚本
│   │       ├── schema.sql         # 表结构
│   │       └── migration.sql      # 迁移脚本
│   ├── start.bat                  # Windows启动脚本
│   ├── start.sh                   # Linux/Mac启动脚本
│   └── pom.xml
│
├── backend_ddd/                   # 后端服务 (Python DDD实现)
│   ├── meta/                      # 领域模型定义
│   │   ├── model/                 # Model聚合
│   │   ├── datasource/            # Datasource聚合
│   │   ├── etl/                   # ETL聚合
│   │   └── shared/                # 共享领域模型
│   ├── application/               # 应用服务层
│   │   ├── model_service.py
│   │   ├── datasource_service.py
│   │   ├── etl_service.py
│   │   └── domain_service.py
│   ├── infrastructure/            # 基础设施层
│   │   ├── repository/            # 仓储实现
│   │   └── persistence/           # 持久化
│   ├── interfaces/                # 接口层
│   │   └── api/                   # API路由
│   ├── app.py                     # Flask应用主文件
│   ├── init_database.py           # 数据库初始化脚本
│   ├── run.py                     # 运行脚本
│   ├── requirements.txt           # Python依赖
│   └── README.md                  # DDD版本说明
│
├── local/                         # 本地文档和配置
│   ├── PROJECT_SUMMARY.md         # 项目总结
│   ├── WORKSPACE_DEFAULT_DOMAIN_GUIDE.md  # 工作空间默认领域指南
│   └── ...
│
├── META_MODEL_DESIGN_ANALYSIS.md  # 元模型设计分析文档
└── README.md
```

## 快速开始

### 1. 前端配置与启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

开发服务器启动后访问: http://localhost:3001

**注意**: 前端配置为监听所有网络接口（0.0.0.0），可通过IP地址访问：http://[你的IP]:3001

### 2. 后端服务 (Java) 配置与启动

#### 环境检查
```bash
# 检查Java版本 (需要JDK 1.8)
java -version

# 检查Maven版本
mvn -version
```

#### 编译与启动

**方式一：使用启动脚本（推荐）**

Windows:
```bash
cd backend_java
start.bat
```

Linux/Mac:
```bash
cd backend_java
chmod +x start.sh
./start.sh
```

**方式二：使用Maven命令**
```bash
cd backend_java

# 编译项目
mvn clean compile

# 启动服务
mvn spring-boot:run
```

**方式三：打包后运行**
```bash
cd backend_java

# 打包（跳过测试）
mvn clean package -DskipTests

# 运行jar包
java -Dfile.encoding=UTF-8 -jar target/platform-1.0.0.jar
```

**注意**: 启动脚本已配置UTF-8编码，确保中文字符正确处理。如果使用Maven命令启动，建议也设置JVM参数：
```bash
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dfile.encoding=UTF-8 -Duser.language=zh -Duser.country=CN"
```

服务启动后访问: http://localhost:5000

**注意**: 后端配置为监听所有网络接口（0.0.0.0），可通过IP地址访问：http://[你的IP]:5000

API文档: http://localhost:5000/swagger-ui.html

### 3. 后端服务 (Python DDD) - 可选

```bash
cd backend_ddd

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或: venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 初始化数据库（首次运行）
python init_database.py

# 启动服务
python app.py
# 或使用运行脚本
python run.py
```

**说明**: Python版本采用领域驱动设计（DDD）架构，提供与Java版本相同的API接口。可根据项目需求选择Java或Python版本。

## 数据库配置

### H2 数据库

项目默认使用 H2 文件数据库，数据库文件位于：
```
backend_java/src/main/resources/app.mv.db
```

配置文件位置：`backend_java/src/main/resources/application.yml`

关键配置：
```yaml
server:
  address: 0.0.0.0  # 监听所有网络接口，允许远程访问
  port: 5000

spring:
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:file:./src/main/resources/app;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE;NON_KEYWORDS=USER,VALUE
    username: sa
    password:
```

数据库文件位置：`backend_java/src/main/resources/app.mv.db`（自动生成）

### 初始化数据

首次启动时，Spring Boot 会自动执行 `db/init/schema.sql` 脚本创建表结构并插入初始数据。

## 常用Maven命令

```bash
# 清理并编译
mvn clean compile

# 运行测试
mvn test

# 打包
mvn package -DskipTests

# 跳过测试打包
mvn clean package -DskipTests

# 依赖分析
mvn dependency:tree

# 更新依赖
mvn clean compile -U
```

## 常见问题

### Q: JDK版本不兼容
A: 确保使用JDK 1.8，可通过 `export JAVA_HOME=/path/to/jdk1.8` 设置。

### Q: Maven编译失败
A: 尝试清理本地仓库缓存：
```bash
mvn clean
```

### Q: 端口被占用
A: 
- 后端：修改 `backend_java/src/main/resources/application.yml` 中的 `server.port` 配置（默认5000）
- 前端：修改 `frontend/vite.config.js` 中的 `server.port` 配置（默认3001），同时更新代理配置中的 `target` 地址

### Q: 前端无法连接后端
A: 
- 检查后端服务是否启动（默认端口5000）
- 检查 `frontend/vite.config.js` 中的代理配置 `target` 是否指向正确的后端地址
- 确保防火墙允许相应端口访问
- 如果通过IP访问，确保后端配置了 `server.address: 0.0.0.0`

### Q: 中文乱码问题
A: 
- 后端：使用提供的启动脚本（start.bat/start.sh），已配置UTF-8编码
- 前端：Vite配置中已设置UTF-8编码，确保浏览器使用UTF-8

### Q: 数据库连接错误
A: 确保数据库文件路径正确，且有读写权限。

## 开发规范

### Java开发规范
- 使用 Lombok 简化代码
- 遵循 JPA 命名策略
- 使用 Validation 进行参数校验
- 统一返回 Result<T> 格式
- 采用分层架构：Controller → Service → Repository
- 使用 DTO 进行数据传输，避免直接暴露 Entity

### 前端开发规范
- 组件功能单一，职责明确
- 使用 CSS 变量统一管理样式
- D3.js 图形元素响应式设计
- API 调用统一通过 `services/api.js`
- 使用 React Hooks 管理状态

### Python DDD开发规范
- 遵循领域驱动设计（DDD）原则
- 分层架构：Interfaces → Application → Domain → Infrastructure
- 使用聚合根管理领域模型
- 通过仓储模式进行数据访问

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 项目文档

- [元模型设计分析](./META_MODEL_DESIGN_ANALYSIS.md) - 详细的元模型系统设计文档
- [工作空间默认领域指南](./local/WORKSPACE_DEFAULT_DOMAIN_GUIDE.md) - 工作空间和默认领域的使用说明
- [DDD架构说明](./backend_ddd/README.md) - Python DDD版本的架构说明

## 技术架构

### 后端架构

**Java版本**：
- Spring Boot 2.7.18
- Spring Data JPA + Hibernate
- H2 文件数据库
- 元模型驱动架构
- 支持自描述元模型系统

**Python DDD版本**：
- Flask Web框架
- DuckDB 数据库
- 领域驱动设计（DDD）架构
- 分层架构：接口层 → 应用层 → 领域层 → 基础设施层

### 前端架构
- React 18 + Vite
- Ant Design 6 UI组件库
- D3.js 数据可视化
- React Router 路由管理

### 元模型系统
- **MetaRegistry**: 元模型注册中心，统一管理所有元模型实体
- **MetaModel**: 业务概念定义
- **MetaProperty**: 属性定义和约束
- **MetaRelation**: 关系定义
- **MetaDomain**: 领域抽象
- 支持数据验证、脱敏、血缘追踪等功能

## 许可证

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。
