package com.jianmo.platform.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import javax.sql.DataSource;

/**
 * 数据库初始化配置
 * 统一使用UTF-8编码，确保跨平台兼容性
 */
@Configuration
public class DatabaseInitConfig {

    private static final Logger logger = LoggerFactory.getLogger(DatabaseInitConfig.class);

    @Bean
    public CommandLineRunner initDatabase(DataSource dataSource) {
        return args -> {
            try {
                logger.info("Initializing database schema with UTF-8 encoding...");
                
                // 使用UTF-8编码执行SQL脚本
                ResourceDatabasePopulator populator = new ResourceDatabasePopulator();
                populator.addScript(new ClassPathResource("db/init/schema.sql"));
                populator.setContinueOnError(true);
                populator.setSqlScriptEncoding("UTF-8");
                populator.execute(dataSource);
                
                logger.info("Database schema initialized successfully!");
            } catch (Exception e) {
                logger.error("Failed to initialize database schema: {}", e.getMessage(), e);
            }
        };
    }
}
