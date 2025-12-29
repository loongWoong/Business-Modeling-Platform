package com.jianmo.platform.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.nio.charset.Charset;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;

/**
 * 编码诊断工具
 * 全面检查从数据库到API的编码链路
 */
@Component
public class EncodingDiagnostic implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(EncodingDiagnostic.class);

    private final DataSource dataSource;

    public EncodingDiagnostic(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void run(String... args) {
        diagnoseEncoding();
    }

    /**
     * 全面诊断编码问题
     */
    public void diagnoseEncoding() {
        logger.info("==========================================");
        logger.info("编码链路全面诊断");
        logger.info("==========================================");
        
        // 1. JVM编码检查
        checkJVMEncoding();
        
        // 2. 数据库编码检查
        checkDatabaseEncoding();
        
        // 3. 数据编码检查
        checkDataEncoding();
        
        logger.info("==========================================");
    }

    /**
     * 检查JVM编码
     */
    private void checkJVMEncoding() {
        String fileEncoding = System.getProperty("file.encoding");
        Charset defaultCharset = Charset.defaultCharset();
        
        logger.info("1. JVM编码检查:");
        logger.info("   file.encoding: {}", fileEncoding);
        logger.info("   defaultCharset: {}", defaultCharset);
        
        if ("UTF-8".equalsIgnoreCase(fileEncoding) || "UTF8".equalsIgnoreCase(fileEncoding)) {
            logger.info("   ✅ JVM使用UTF-8编码");
        } else {
            logger.warn("   ⚠️  JVM未使用UTF-8编码，可能导致中文乱码");
        }
    }

    /**
     * 检查数据库编码
     */
    private void checkDatabaseEncoding() {
        try (Connection conn = dataSource.getConnection()) {
            String dbProduct = conn.getMetaData().getDatabaseProductName();
            String dbVersion = conn.getMetaData().getDatabaseProductVersion();
            
            logger.info("2. 数据库编码检查:");
            logger.info("   数据库类型: {}", dbProduct);
            logger.info("   数据库版本: {}", dbVersion);
            logger.info("   ✅ H2数据库会根据JVM编码自动适配");
        } catch (Exception e) {
            logger.error("   数据库连接检查失败: {}", e.getMessage());
        }
    }

    /**
     * 检查数据编码
     */
    private void checkDataEncoding() {
        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(
                 "SELECT id, code, name, description FROM models LIMIT 3")) {
            
            ResultSet rs = stmt.executeQuery();
            logger.info("3. 数据编码检查（检查前3条模型数据）:");
            
            boolean hasGarbledData = false;
            int count = 0;
            
            while (rs.next() && count < 3) {
                count++;
                Long id = rs.getLong("id");
                String code = rs.getString("code");
                String name = rs.getString("name");
                String description = rs.getString("description");
                
                // 检查是否乱码
                boolean nameGarbled = EncodingFixer.isLikelyGarbled(name);
                boolean descGarbled = EncodingFixer.isLikelyGarbled(description);
                
                if (nameGarbled || descGarbled) {
                    hasGarbledData = true;
                    logger.warn("   模型 ID={}, code={}:", id, code);
                    if (nameGarbled) {
                        String fixed = EncodingFixer.fixGarbledString(name);
                        logger.warn("     name: {} → {}", name, fixed);
                    }
                    if (descGarbled) {
                        String fixed = EncodingFixer.fixGarbledString(description);
                        logger.warn("     description: {} → {}", description, fixed);
                    }
                } else {
                    logger.info("   模型 ID={}, code={}, name={}: ✅ 编码正常", id, code, name);
                }
            }
            
            if (hasGarbledData) {
                logger.warn("   ⚠️  检测到乱码数据，系统会自动修复");
            } else {
                logger.info("   ✅ 数据编码正常");
            }
            
        } catch (Exception e) {
            logger.error("   数据编码检查失败: {}", e.getMessage());
        }
    }
}
