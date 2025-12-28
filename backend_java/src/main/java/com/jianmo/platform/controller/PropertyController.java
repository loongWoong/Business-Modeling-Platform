package com.jianmo.platform.controller;

import com.jianmo.platform.common.Result;
import com.jianmo.platform.dto.request.PropertyCreateDTO;
import com.jianmo.platform.dto.request.PropertyUpdateDTO;
import com.jianmo.platform.dto.response.PropertyVO;
import com.jianmo.platform.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "属性管理", description = "模型属性相关API")
@RestController
@RequestMapping("/api/property")
public class PropertyController {

    private final PropertyService propertyService;

    public PropertyController(PropertyService propertyService) {
        this.propertyService = propertyService;
    }

    @Operation(summary = "获取所有属性")
    @GetMapping
    public Result<List<PropertyVO>> getAllProperties(@RequestParam(required = false) Long modelId) {
        return Result.success(propertyService.getAllProperties(modelId));
    }

    @Operation(summary = "获取属性详情")
    @GetMapping("/{id}")
    public Result<PropertyVO> getProperty(@PathVariable Long id) {
        return Result.success(propertyService.getPropertyById(id));
    }

    @Operation(summary = "创建属性")
    @PostMapping
    public Result<PropertyVO> createProperty(@Valid @RequestBody PropertyCreateDTO dto) {
        return Result.success(propertyService.createProperty(dto));
    }

    @Operation(summary = "更新属性")
    @PutMapping("/{id}")
    public Result<PropertyVO> updateProperty(@PathVariable Long id, @RequestBody PropertyUpdateDTO dto) {
        return Result.success(propertyService.updateProperty(id, dto));
    }

    @Operation(summary = "删除属性")
    @DeleteMapping("/{id}")
    public Result<Void> deleteProperty(@PathVariable Long id) {
        return propertyService.deleteProperty(id)
                ? Result.success()
                : Result.error(404, "属性不存在");
    }
}
