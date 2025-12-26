# 安装和运行指南

## 环境要求

- Python 3.8+
- pip

## 安装步骤

### 1. 安装依赖

```bash
cd backend_ddd
pip install -r requirements.txt
```

### 2. 初始化数据库

```bash
python init_database.py
```

这将创建 `app.data.db` 数据库文件。

### 3. 启动应用

有两种方式启动应用：

#### 方式1：使用run.py（推荐）

```bash
python run.py
```

#### 方式2：直接运行app.py

```bash
python app.py
```

应用将在 `http://localhost:5000` 启动。

## 验证安装

访问健康检查端点：

```bash
curl http://localhost:5000/health
```

应该返回：
```json
{"status": "healthy"}
```

## API测试

### 创建Domain

```bash
curl -X POST http://localhost:5000/api/domain \
  -H "Content-Type: application/json" \
  -d '{"name": "测试域", "description": "测试描述"}'
```

### 创建Model

```bash
curl -X POST http://localhost:5000/api/model \
  -H "Content-Type: application/json" \
  -d '{"name": "用户模型", "code": "user", "description": "用户业务模型"}'
```

### 获取所有Model

```bash
curl http://localhost:5000/api/model
```

## 常见问题

### 1. 导入错误

如果遇到导入错误，确保：
- 在 `backend_ddd` 目录下运行
- 已安装所有依赖：`pip install -r requirements.txt`

### 2. 数据库连接错误

如果遇到数据库连接错误：
- 确保已运行 `python init_database.py`
- 检查 `app.data.db` 文件是否存在

### 3. 端口被占用

如果5000端口被占用，可以修改 `app.py` 或 `run.py` 中的端口号。

## 开发建议

1. 使用虚拟环境：
```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. 使用调试模式（已默认开启）：
   - 代码修改会自动重载
   - 错误信息更详细

3. 查看日志：
   - Flask会在控制台输出请求日志
   - 错误信息会显示详细堆栈

