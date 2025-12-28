package com.jianmo.platform.controller;

import com.jianmo.platform.dto.request.PropertyCreateDTO;
import com.jianmo.platform.dto.request.PropertyUpdateDTO;
import com.jianmo.platform.dto.response.PropertyVO;
import com.jianmo.platform.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    public List<PropertyVO> getAllProperties(@RequestParam(required = false) Long modelId) {
        return propertyService.getAllProperties(modelId);
    }

    @Operation(summary = "获取属性详情")
    @GetMapping("/{id}")
    public PropertyVO getProperty(@PathVariable Long id) {
        return propertyService.getPropertyById(id);
    }

    @Operation(summary = "创建属性")
    @PostMapping
    public PropertyVO createProperty(@RequestBody PropertyCreateDTO dto) {
        return propertyService.createProperty(dto);
    }

    @Operation(summary = "更新属性")
    @PutMapping("/{id}")
    public PropertyVO updateProperty(@PathVariable Long id, @RequestBody PropertyUpdateDTO dto) {
        return propertyService.updateProperty(id, dto);
    }

    @Operation(summary = "删除属性")
    @DeleteMapping("/{id}")
    public void deleteProperty(@PathVariable Long id) {
        propertyService.deleteProperty(id);
    }
}
