package com.jianmo.platform.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.nio.charset.Charset;

/**
 * 编码检查工具
 * 在应用启动时检查JVM编码设置，确保使用UTF-8编码
 * 解决Windows环境下的中文乱码问题
 */
@Component
public class EncodingChecker implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(EncodingChecker.class);

    @Override
    public void run(String... args) {
        checkEncoding();
    }

    /**
     * 检查并输出当前JVM编码设置
     */
    public static void checkEncoding() {
        Logger logger = LoggerFactory.getLogger(EncodingChecker.class);
        
        String fileEncoding = System.getProperty("file.encoding");
        String userLanguage = System.getProperty("user.language");
        String userCountry = System.getProperty("user.country");
        Charset defaultCharset = Charset.defaultCharset();
        
        logger.info("==========================================");
        logger.info("JVM编码配置检查");
        logger.info("==========================================");
        logger.info("file.encoding: {}", fileEncoding);
        logger.info("user.language: {}", userLanguage);
        logger.info("user.country: {}", userCountry);
        logger.info("defaultCharset: {}", defaultCharset);
        logger.info("==========================================");
        
        // 检查是否为UTF-8
        if (!"UTF-8".equalsIgnoreCase(fileEncoding) && !"UTF8".equalsIgnoreCase(fileEncoding)) {
            logger.warn("⚠️  警告：JVM未使用UTF-8编码！");
            logger.warn("   当前编码: {}", fileEncoding);
            logger.warn("   这可能导致中文乱码问题");
            logger.warn("   解决方案：使用 start.bat (Windows) 或 start.sh (macOS/Linux) 启动应用");
            logger.warn("   或设置JVM参数: -Dfile.encoding=UTF-8");
        } else {
            logger.info("✅ JVM编码配置正确，使用UTF-8");
            logger.info("   数据库和API将统一使用UTF-8编码，确保中文正确显示");
            logger.info("   注意：控制台输出可能仍显示乱码，但不影响API返回的数据");
        }
        
        logger.info("==========================================");
    }
}
