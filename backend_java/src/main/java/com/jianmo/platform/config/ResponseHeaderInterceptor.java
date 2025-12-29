package com.jianmo.platform.config;

import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 响应头拦截器
 * 确保所有响应都包含UTF-8编码的Content-Type头
 * 解决前端中文乱码问题
 */
@Component
public class ResponseHeaderInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // 设置请求编码
        try {
            request.setCharacterEncoding("UTF-8");
        } catch (Exception e) {
            // 忽略异常
        }
        
        // 设置响应编码
        response.setCharacterEncoding("UTF-8");
        
        // 确保Content-Type包含charset（如果还没有设置）
        String contentType = response.getContentType();
        if (contentType == null || (!contentType.contains("charset") && contentType.contains("json"))) {
            response.setContentType("application/json;charset=UTF-8");
        }
        
        return true;
    }
}
