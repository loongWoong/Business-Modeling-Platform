# H2数据库Windows中文乱码问题解决方案

## 问题分析

H2数据库在Windows环境下可能出现中文乱码，主要原因：

1. **Windows系统默认编码**：Windows系统默认使用GBK/GB2312编码，而不是UTF-8
2. **JVM文件编码**：如果JVM启动时没有指定UTF-8编码，会使用系统默认编码（Windows通常是GBK）
3. **数据库文件编码**：H2数据库文件创建时使用JVM的默认编码
4. **SQL脚本编码**：SQL初始化脚本文件需要与系统编码匹配

## 解决方案：动态编码适配

系统已实现**自动编码适配机制**，会根据操作系统和JVM编码自动选择数据库编码：

- **Windows系统（GBK编码）**：自动使用GBK编码处理数据库和SQL脚本
- **macOS/Linux系统（UTF-8编码）**：自动使用UTF-8编码处理数据库和SQL脚本

### 编码适配机制

系统通过 `EncodingAdapter` 工具类自动检测：
1. 检测操作系统类型（Windows/macOS/Linux）
2. 检测JVM默认编码（`file.encoding` 系统属性）
3. 根据检测结果自动选择数据库编码：
   - Windows + GBK/GB2312/GB18030 → 使用GBK
   - 其他情况 → 使用UTF-8

### 1. 自动编码适配（推荐，已实现）

系统会自动检测并适配编码，**无需手动配置**。启动时会显示：

```
系统编码配置检查
==========================================
操作系统: Windows
file.encoding: GBK
系统编码: GBK
数据库编码: GBK
==========================================
✅ Windows系统检测到GBK编码，数据库将使用GBK编码
```

### 2. H2数据库连接URL配置

已在 `application.yml` 中配置：
```yaml
spring:
  datasource:
    url: jdbc:h2:file:./src/main/resources/app;MODE=MySQL;DATABASE_TO_LOWER=TRUE;AUTO_SERVER=TRUE;NON_KEYWORDS=USER,VALUE
```

**重要说明**：
- H2数据库**不支持** `CHARSET` 连接参数，添加会导致连接失败
- H2数据库会根据JVM编码自动适配，系统已实现动态编码适配
- **关键**：系统会自动根据操作系统和JVM编码选择正确的数据库编码

### 3. SQL脚本文件编码

**重要**：`schema.sql` 文件应保存为UTF-8编码（这是标准做法），系统会根据环境自动适配读取编码：
- Windows GBK环境：系统会使用GBK编码读取SQL脚本（自动转换）
- macOS/Linux UTF-8环境：系统会使用UTF-8编码读取SQL脚本

在IDE中设置：
- File -> Properties -> Text file encoding -> UTF-8
- 确保保存为UTF-8 without BOM

### 4. 数据库初始化配置

已在 `DatabaseInitConfig` 中配置：
- 自动检测系统编码，动态设置SQL脚本读取编码
- Windows GBK环境：使用GBK编码读取SQL脚本
- macOS/Linux UTF-8环境：使用UTF-8编码读取SQL脚本

### 5. 如果数据库已存在乱码数据

如果数据库中已经有乱码数据，需要：

**方案1：删除数据库文件重新初始化（推荐）**
```bash
# 停止应用
# 删除数据库文件
rm backend_java/src/main/resources/app.mv.db
rm backend_java/src/main/resources/app.trace.db
# 重启应用，系统会重新执行schema.sql
```

**方案2：手动修复数据**
```sql
-- 使用H2控制台连接数据库
-- 手动更新包含中文的字段
UPDATE domains SET name = '默认领域' WHERE code = 'default';
-- ... 其他数据
```

## 验证方法

### 1. 检查JVM编码
在应用启动日志中查看，或添加测试代码：
```java
System.out.println("File encoding: " + System.getProperty("file.encoding"));
System.out.println("Default charset: " + Charset.defaultCharset());
```

### 2. 测试中文存储和读取
1. 通过API创建包含中文的Domain或Model
2. 查询数据，检查中文是否正确显示
3. 使用H2控制台直接查询数据库，检查中文是否正确

### 3. 使用H2控制台验证
```bash
# 启动H2控制台（如果配置了）
java -cp h2-*.jar org.h2.tools.Server -web -webAllowOthers

# 连接URL
jdbc:h2:file:./src/main/resources/app

# 执行查询
SELECT * FROM domains;
```

## 兼容性说明

- ✅ **Windows 10/11**：自动检测GBK编码，使用GBK处理数据库和SQL脚本
- ✅ **macOS**：自动检测UTF-8编码，使用UTF-8处理数据库和SQL脚本
- ✅ **Linux**：自动检测UTF-8编码，使用UTF-8处理数据库和SQL脚本
- ✅ **Java 8+**：所有版本都支持，系统会自动适配编码

## 关键要点

1. **最关键的配置**：JVM启动参数 `-Dfile.encoding=UTF-8`
2. **SQL脚本编码**：确保 `schema.sql` 是UTF-8编码
3. **数据库连接**：H2默认支持UTF-8，只要JVM使用UTF-8即可
4. **现有数据**：如果数据已乱码，需要重新初始化数据库

## 故障排查

### 问题：数据库查询仍然显示乱码

1. **检查系统编码适配**：
   - 查看启动日志中的"系统编码配置检查"部分
   - 确认系统是否正确检测到编码（Windows应显示GBK，macOS/Linux应显示UTF-8）
   - 确认数据库编码是否正确适配

2. **检查数据库文件**：
   - 如果数据库文件已存在且包含乱码数据，需要删除重新创建
   - 删除 `app.mv.db` 和 `app.trace.db` 文件后重启应用

3. **检查SQL脚本**：
   - 确保 `schema.sql` 文件是UTF-8编码（标准做法）
   - 系统会根据环境自动适配读取编码

4. **检查应用日志**：
   - 查看是否有编码相关的警告或错误
   - 确认"数据库编码"是否正确显示

### 问题：新插入的数据是乱码

1. **检查系统编码适配**：
   - 确认系统已正确检测并适配编码
   - Windows环境应使用GBK，macOS/Linux应使用UTF-8

2. **检查API请求编码**：
   - 检查API请求的Content-Type是否包含正确的charset
   - Windows环境：charset=GBK 或 charset=UTF-8（如果强制使用UTF-8）
   - macOS/Linux环境：charset=UTF-8

3. **检查前端编码**：
   - 确保前端正确发送编码的数据
   - 检查HTTP请求头中的Content-Type

## 总结

H2数据库在Windows下的中文乱码问题，系统已实现**自动编码适配机制**：

1. **自动检测**：系统启动时自动检测操作系统和JVM编码
2. **动态适配**：根据检测结果自动选择数据库编码（Windows GBK，macOS/Linux UTF-8）
3. **无需配置**：无需手动设置JVM参数或修改配置文件
4. **兼容性好**：支持Windows GBK环境和macOS/Linux UTF-8环境

**使用方式**：
- 直接启动应用即可，系统会自动适配编码
- 查看启动日志确认编码选择是否正确
- 如果数据库已有乱码数据，删除数据库文件重新初始化

**注意**：如果希望强制使用UTF-8编码，可以使用启动脚本（`start.bat` 或 `start.sh`）设置JVM参数 `-Dfile.encoding=UTF-8`，系统会自动检测并使用UTF-8。
