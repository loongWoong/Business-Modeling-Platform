package com.jianmo.platform.controller;

import com.jianmo.platform.dto.request.IndicatorCreateDTO;
import com.jianmo.platform.dto.response.IndicatorVO;
import com.jianmo.platform.service.IndicatorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "指标管理", description = "语义层-指标相关API")
@RestController
@RequestMapping("/api/indicator")
public class IndicatorController {

    private final IndicatorService service;

    public IndicatorController(IndicatorService service) {
        this.service = service;
    }

    @Operation(summary = "获取所有指标")
    @GetMapping
    public List<IndicatorVO> getAllIndicators(@RequestParam(required = false) Long domainId) {
        return service.getAllIndicators(domainId);
    }

    @Operation(summary = "获取指标详情")
    @GetMapping("/{id}")
    public IndicatorVO getIndicator(@PathVariable Long id) {
        return service.getIndicatorById(id);
    }

    @Operation(summary = "创建指标")
    @PostMapping
    public IndicatorVO createIndicator(@RequestBody IndicatorCreateDTO dto) {
        return service.createIndicator(dto);
    }

    @Operation(summary = "更新指标")
    @PutMapping("/{id}")
    public IndicatorVO updateIndicator(@PathVariable Long id, @RequestBody IndicatorCreateDTO dto) {
        return service.updateIndicator(id, dto);
    }

    @Operation(summary = "删除指标")
    @DeleteMapping("/{id}")
    public void deleteIndicator(@PathVariable Long id) {
        service.deleteIndicator(id);
    }
}
