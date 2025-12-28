package com.jianmo.platform.controller;

import com.jianmo.platform.dto.response.MetaModelVO;
import com.jianmo.platform.service.MetaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "元模型管理", description = "元模型相关API")
@RestController
@RequestMapping("/api/meta")
public class MetaController {

    private final MetaService metaService;

    public MetaController(MetaService metaService) {
        this.metaService = metaService;
    }

    @Operation(summary = "获取所有元模型")
    @GetMapping("/models")
    public List<MetaModelVO> getAllMetaModels() {
        return metaService.getAllMetaModels();
    }

    @Operation(summary = "获取指定元模型")
    @GetMapping("/models/{code}")
    public MetaModelVO getMetaModel(@PathVariable String code) {
        return metaService.getMetaModel(code);
    }

    @Operation(summary = "导出元模型为JSON")
    @GetMapping("/export")
    public String exportMetaModel() {
        return metaService.exportMetaModelAsJson();
    }

    @Operation(summary = "刷新元模型缓存")
    @PostMapping("/refresh")
    public void refreshMetaCache() {
        metaService.refreshMetaCache();
    }
}
