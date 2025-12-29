package com.jianmo.platform.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.nio.charset.Charset;

/**
 * 编码修复工具
 * 修复已存在的乱码数据（GBK字节被错误解释为UTF-8的情况）
 * 
 * 乱码特征：
 * - "鐢ㄦ埛" 应该是 "用户"
 * - "瑙掕壊" 应该是 "角色"
 * - "鏉冮檺" 应该是 "权限"
 * - "绯荤粺" 应该是 "系统"
 * - "妯″瀷" 应该是 "模型"
 * - "瀹氫箟" 应该是 "定义"
 */
public class EncodingFixer {

    private static final Logger logger = LoggerFactory.getLogger(EncodingFixer.class);

    /**
     * 修复乱码字符串
     * 将GBK字节被错误解释为UTF-8的字符串修复为正确的UTF-8字符串
     * 
     * @param garbledStr 乱码字符串
     * @return 修复后的UTF-8字符串
     */
    public static String fixGarbledString(String garbledStr) {
        if (garbledStr == null || garbledStr.isEmpty()) {
            return garbledStr;
        }

        try {
            // 步骤1：将乱码字符串按ISO-8859-1获取原始字节
            // ISO-8859-1是单字节编码，不会改变字节值，可以获取原始字节
            byte[] originalBytes = garbledStr.getBytes(Charset.forName("ISO-8859-1"));
            
            // 步骤2：将这些字节按GBK解释，得到正确的GBK字符串
            String gbkString = new String(originalBytes, Charset.forName("GBK"));
            
            // 步骤3：将GBK字符串转换为UTF-8
            // Java String内部是UTF-16，这里我们确保返回的字符串是正确的
            // 当Jackson序列化时，会正确转换为UTF-8字节
            return gbkString;
            
        } catch (Exception e) {
            logger.warn("编码修复失败: {}, 返回原字符串", e.getMessage());
            return garbledStr;
        }
    }

    /**
     * 判断字符串是否可能是乱码
     * 通过检查是否包含典型的GBK被错误解释为UTF-8的字符模式
     */
    public static boolean isLikelyGarbled(String str) {
        if (str == null || str.isEmpty()) {
            return false;
        }
        
        // 检查是否包含乱码特征字符
        String[] garbledPatterns = {
            "鐢", "埛", "瑙", "掕", "壊", "鏉", "冮", "檺",
            "绯", "荤", "粺", "妯", "″", "瀷", "瀹", "氫", "箟"
        };
        
        for (String pattern : garbledPatterns) {
            if (str.contains(pattern)) {
                return true;
            }
        }
        
        return false;
    }

    /**
     * 智能修复：如果检测到乱码则修复，否则直接返回
     */
    public static String smartFix(String str) {
        if (str == null) {
            return null;
        }
        
        if (isLikelyGarbled(str)) {
            return fixGarbledString(str);
        }
        
        return str;
    }
}
