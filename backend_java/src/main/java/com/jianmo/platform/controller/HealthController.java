package com.jianmo.platform.controller;

import com.jianmo.platform.common.Result;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "健康检查", description = "系统健康检查API")
@RestController
public class HealthController {

    @Operation(summary = "健康检查")
    @GetMapping("/health")
    public Result<Map<String, Object>> health() {
        Map<String, Object> healthInfo = new HashMap<>();
        healthInfo.put("status", "UP");
        healthInfo.put("timestamp", LocalDateTime.now().toString());
        healthInfo.put("service", "jianmo-platform");
        healthInfo.put("version", "1.0.0");
        return Result.success(healthInfo);
    }

    @Operation(summary = "API信息")
    @GetMapping("/api/info")
    public Result<Map<String, Object>> info() {
        Map<String, Object> info = new HashMap<>();
        info.put("name", "业务建模平台API");
        info.put("version", "1.0.0");
        info.put("description", "基于DDD架构的业务建模平台后端接口");
        return Result.success(info);
    }
}
