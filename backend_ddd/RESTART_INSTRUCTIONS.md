# 重启后端服务说明

## 问题：405 METHOD NOT ALLOWED 错误

如果遇到 405 错误，请按照以下步骤操作：

### 1. 停止当前运行的后端服务

如果后端服务正在运行，请先停止它：
- 在运行后端的终端窗口中按 `Ctrl+C`
- 或者关闭终端窗口

### 2. 重新启动后端服务

```bash
cd backend_ddd
python app.py
```

或者使用：

```bash
cd backend_ddd
python run.py
```

### 3. 验证服务是否正常运行

打开浏览器访问：`http://localhost:5000/health`

应该看到：
```json
{"status": "healthy"}
```

### 4. 测试 API 端点

运行测试脚本：
```bash
python backend_ddd/test_api.py
```

### 5. 清除浏览器缓存

1. 打开浏览器开发者工具（F12）
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"

或者：
- Chrome/Edge: `Ctrl+Shift+R` (Windows) 或 `Cmd+Shift+R` (Mac)
- Firefox: `Ctrl+F5` (Windows) 或 `Cmd+Shift+R` (Mac)

### 6. 检查后端日志

查看后端控制台输出，确认：
- 服务已启动
- 没有错误信息
- 路由已正确注册

### 常见问题

#### 问题 1: 端口已被占用

如果看到 "Address already in use" 错误：

**Windows:**
```bash
netstat -ano | findstr :5000
taskkill /PID <PID号> /F
```

**Mac/Linux:**
```bash
lsof -ti:5000 | xargs kill -9
```

#### 问题 2: 模块导入错误

确保已安装所有依赖：
```bash
cd backend_ddd
pip install -r requirements.txt
```

#### 问题 3: 数据库连接错误

确保数据库文件存在：
```bash
cd backend_ddd
python init_database.py
```

### 验证清单

- [ ] 后端服务已停止
- [ ] 后端服务已重新启动
- [ ] 健康检查端点返回正常
- [ ] 浏览器缓存已清除
- [ ] 前端页面已刷新
- [ ] 浏览器控制台无错误

### 如果问题仍然存在

1. **检查后端日志**：查看后端控制台的完整错误信息
2. **检查网络请求**：在浏览器开发者工具的 Network 标签中查看请求详情
3. **验证 CORS 配置**：确认 `backend_ddd/app.py` 中的 CORS 配置正确
4. **检查路由注册**：确认所有蓝图都已正确注册

