-- 数据库迁移脚本（H2兼容版本）
-- 用于更新现有数据库表结构，添加新字段
-- 注意：如果字段已存在，执行会失败，但continue-on-error: true会忽略错误

-- 为domains表添加新字段
-- 使用IF NOT EXISTS语法（H2 1.4.200+支持）
ALTER TABLE domains ADD COLUMN IF NOT EXISTS domain_type VARCHAR(20) DEFAULT 'category';
ALTER TABLE domains ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
ALTER TABLE domains ADD COLUMN IF NOT EXISTS model_quota INT;
ALTER TABLE domains ADD COLUMN IF NOT EXISTS permissions TEXT;
ALTER TABLE domains ADD COLUMN IF NOT EXISTS workspace_config TEXT;

-- 更新现有记录的默认值
UPDATE domains SET domain_type = 'category' WHERE domain_type IS NULL;
UPDATE domains SET is_active = TRUE WHERE is_active IS NULL;
