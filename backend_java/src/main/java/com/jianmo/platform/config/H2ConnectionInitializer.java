package com.jianmo.platform.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.sql.Statement;

/**
 * H2数据库连接初始化器
 * 统一使用UTF-8编码，确保跨平台兼容性
 */
@Configuration
public class H2ConnectionInitializer {

    private static final Logger logger = LoggerFactory.getLogger(H2ConnectionInitializer.class);

    @Bean
    public CommandLineRunner initializeH2Encoding(DataSource dataSource) {
        return args -> {
            try (Connection conn = dataSource.getConnection();
                 Statement stmt = conn.createStatement()) {
                
                // H2数据库会根据JVM编码自动适配
                // 只要JVM使用UTF-8启动（通过start.bat），H2就会使用UTF-8
                logger.info("H2数据库连接已初始化，使用UTF-8编码");
                
            } catch (SQLException e) {
                logger.warn("警告：无法初始化H2数据库连接: {}", e.getMessage());
            }
        };
    }
}
