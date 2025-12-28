# 业务建模平台 (Business-Modeling-Platform)

参考palantir的本体论思想构建的业务建模平台，用于驱动数据治理平台应用。基于React、Ant Design和D3.js的现代化领域驱动设计(DDD)可视化建模工具。

## 功能特性

### 1. 业务域地图 (Domain Map)
- 可视化展示业务域及其相互关系
- D3.js力导向图展示域间关联
- 支持域的创建、导出等操作

### 2. 域工作台 (Domain Workbench)
- 模型地图：D3.js力导向图可视化展示模型及属性关系
- 模型管理：增删改查模型定义
- 共享属性：定义可在多个模型中复用的属性
- 关系管理：配置模型间的各种关系
- 语义/指标：定义业务语义和计算指标
- ER图和UML图可视化展示

### 3. 模型详情 (Model Detail)
- 属性管理：定义模型的具体属性
- 关系配置：配置模型间的关系
- 数据源管理：连接外部数据源
- 数据浏览：查看实际数据记录
- 语义指标：绑定和管理模型相关的语义指标
- 血缘分析：可视化展示数据血缘关系

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

### 后端 (Python)
- **框架**: Flask / FastAPI (可选)
- **Python版本**: 3.10+

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
jianmo-demo/
├── frontend/                 # 前端项目 (React)
│   ├── src/
│   │   ├── components/       # 通用组件
│   │   ├── pages/            # 页面组件
│   │   │   ├── DomainMap/    # 业务域地图
│   │   │   ├── DomainWorkbench/  # 域工作台
│   │   │   └── ModelDetail/  # 模型详情
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend_java/             # 后端服务 (Java)
│   ├── src/main/java/
│   │   └── com/jianmo/platform/
│   │       ├── config/       # 配置类
│   │       ├── controller/   # REST API控制器
│   │       ├── dto/          # 数据传输对象
│   │       ├── entity/       # 实体类
│   │       ├── repository/   # 数据访问层
│   │       └── service/      # 业务逻辑层
│   ├── src/main/resources/
│   │   ├── application.yml   # 应用配置
│   │   └── db/init/          # 数据库初始化脚本
│   └── pom.xml
│
├── backend_python/           # 后端服务 (Python) - 可选
│   ├── app.py
│   ├── requirements.txt
│   └── ...
│
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

开发服务器启动后访问: http://localhost:5173

### 2. 后端服务 (Java) 配置与启动

#### 环境检查
```bash
# 检查Java版本 (需要JDK 1.8)
java -version

# 检查Maven版本
mvn -version
```

#### 编译与启动
```bash
cd backend_java

# 编译项目
mvn clean compile

# 启动服务
mvn spring-boot:run
```

服务启动后访问: http://localhost:5001

API文档: http://localhost:5001/swagger-ui.html

### 3. 后端服务 (Python) - 可选

```bash
cd backend_python

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Linux/Mac
# 或: venv\Scripts\activate  # Windows

# 安装依赖
pip install -r requirements.txt

# 启动服务
python app.py
```

## 数据库配置

### H2 数据库

项目默认使用 H2 文件数据库，数据库文件位于：
```
backend_java/src/main/resources/app.mv.db
```

配置文件位置：`backend_java/src/main/resources/application.yml`

关键配置：
```yaml
spring:
  datasource:
    driver-class-name: org.h2.Driver
    url: jdbc:h2:file:路径/to/app;AUTO_SERVER=TRUE
    username: sa
    password:
```

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
A: 修改 `application.yml` 中的 `server.port` 配置。

### Q: 数据库连接错误
A: 确保数据库文件路径正确，且有读写权限。

## 开发规范

### Java开发规范
- 使用 Lombok 简化代码
- 遵循 JPA 命名策略
- 使用 Validation 进行参数校验
- 统一返回 Result<T> 格式

### 前端开发规范
- 组件功能单一，职责明确
- 使用 CSS 变量统一管理样式
- D3.js 图形元素响应式设计

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 许可证

MIT License

## 贡献指南

欢迎提交 Issue 和 Pull Request 来改进这个项目。
