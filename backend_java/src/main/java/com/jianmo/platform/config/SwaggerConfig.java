package com.jianmo.platform.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("业务建模平台 API")
                        .description("基于DDD架构的业务建模平台后端接口文档")
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Jianmo")
                                .email("support@jianmo.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .servers(new ArrayList<Server>() {{
                    add(new Server().url("http://127.0.0.1:5001").description("本地开发环境"));
                }});
    }
}
