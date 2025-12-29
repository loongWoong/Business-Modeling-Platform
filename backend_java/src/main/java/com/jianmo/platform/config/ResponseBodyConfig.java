package com.jianmo.platform.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.StringHttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.util.List;

/**
 * 响应体编码配置
 * 确保所有HTTP响应消息转换器都使用UTF-8编码
 * 解决前端中文乱码问题
 */
@Configuration
public class ResponseBodyConfig implements WebMvcConfigurer {

    @Override
    public void configureMessageConverters(List<HttpMessageConverter<?>> converters) {
        // 确保String转换器使用UTF-8
        StringHttpMessageConverter stringConverter = new StringHttpMessageConverter(StandardCharsets.UTF_8);
        converters.add(stringConverter);
        
        // 确保Jackson转换器使用UTF-8
        MappingJackson2HttpMessageConverter jsonConverter = new MappingJackson2HttpMessageConverter();
        jsonConverter.setDefaultCharset(StandardCharsets.UTF_8);
        converters.add(jsonConverter);
    }
}
