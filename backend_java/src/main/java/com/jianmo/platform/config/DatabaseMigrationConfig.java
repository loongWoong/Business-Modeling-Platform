package com.jianmo.platform.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 数据库迁移配置
 * 用于在应用启动时自动添加新字段到现有表
 */
@Component
@Order(1) // 在MetaConfig之前执行
public class DatabaseMigrationConfig implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public DatabaseMigrationConfig(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) {
        try {
            migrateDomainsTable();
        } catch (Exception e) {
            // 忽略迁移错误，可能是字段已存在
            System.out.println("数据库迁移执行完成（某些字段可能已存在）: " + e.getMessage());
        }
    }

    private void migrateDomainsTable() {
        // 检查domains表是否存在
        String checkTableSql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'DOMAINS'";
        Integer tableCount = jdbcTemplate.queryForObject(checkTableSql, Integer.class);
        
        if (tableCount == null || tableCount == 0) {
            // 表不存在，schema.sql会创建，无需迁移
            return;
        }

        // 检查并添加domain_type字段
        if (!columnExists("DOMAINS", "DOMAIN_TYPE")) {
            jdbcTemplate.execute("ALTER TABLE domains ADD COLUMN domain_type VARCHAR(20) DEFAULT 'category'");
            System.out.println("已添加字段: domains.domain_type");
        }

        // 检查并添加is_active字段
        if (!columnExists("DOMAINS", "IS_ACTIVE")) {
            jdbcTemplate.execute("ALTER TABLE domains ADD COLUMN is_active BOOLEAN DEFAULT TRUE");
            System.out.println("已添加字段: domains.is_active");
        }

        // 检查并添加model_quota字段
        if (!columnExists("DOMAINS", "MODEL_QUOTA")) {
            jdbcTemplate.execute("ALTER TABLE domains ADD COLUMN model_quota INT");
            System.out.println("已添加字段: domains.model_quota");
        }

        // 检查并添加permissions字段
        if (!columnExists("DOMAINS", "PERMISSIONS")) {
            jdbcTemplate.execute("ALTER TABLE domains ADD COLUMN permissions TEXT");
            System.out.println("已添加字段: domains.permissions");
        }

        // 检查并添加workspace_config字段
        if (!columnExists("DOMAINS", "WORKSPACE_CONFIG")) {
            jdbcTemplate.execute("ALTER TABLE domains ADD COLUMN workspace_config TEXT");
            System.out.println("已添加字段: domains.workspace_config");
        }

        // 更新现有记录的默认值
        jdbcTemplate.execute("UPDATE domains SET domain_type = 'category' WHERE domain_type IS NULL");
        jdbcTemplate.execute("UPDATE domains SET is_active = TRUE WHERE is_active IS NULL");
    }

    private boolean columnExists(String tableName, String columnName) {
        try {
            String sql = "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                        "WHERE TABLE_NAME = ? AND COLUMN_NAME = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, tableName, columnName);
            return count != null && count > 0;
        } catch (Exception e) {
            return false;
        }
    }
}
