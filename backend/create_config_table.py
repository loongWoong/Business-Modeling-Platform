#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
创建配置表，用于存储全局目标数据源等配置信息
"""

import duckdb
import os

# 获取数据库路径
script_dir = os.path.dirname(os.path.abspath(__file__))
db_path = os.path.join(script_dir, 'app.data.db')

# 连接到数据库
conn = duckdb.connect(db_path)
cursor = conn.cursor()

# 创建配置表
try:
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS configs (
        id INTEGER PRIMARY KEY,
        key VARCHAR UNIQUE NOT NULL,
        value VARCHAR,
        description VARCHAR,
        createdAt DATE,
        updatedAt DATE
    )
    ''')
    print("配置表创建成功")
    
    # 插入默认配置项
    cursor.execute('''
    INSERT OR IGNORE INTO configs (id, key, value, description, createdAt, updatedAt) 
    VALUES (1, 'global_target_datasource_id', NULL, '全局目标数据源ID', CURRENT_DATE, CURRENT_DATE)
    ''')
    print("默认配置项插入成功")
    
    conn.commit()
except Exception as e:
    print(f"创建配置表失败: {e}")
    conn.rollback()
finally:
    conn.close()
