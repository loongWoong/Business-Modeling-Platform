package com.jianmo.platform.controller;

import com.jianmo.platform.common.Result;
import com.jianmo.platform.dto.request.MappingCreateDTO;
import com.jianmo.platform.dto.request.MappingUpdateDTO;
import com.jianmo.platform.dto.response.MappingVO;
import com.jianmo.platform.service.MappingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "映射管理", description = "数据源字段映射相关API")
@RestController
@RequestMapping("/api/mapping")
public class MappingController {

    private final MappingService mappingService;

    public MappingController(MappingService mappingService) {
        this.mappingService = mappingService;
    }

    @Operation(summary = "获取所有映射")
    @GetMapping
    public Result<List<MappingVO>> getAllMappings(
            @RequestParam(required = false) Long datasourceId,
            @RequestParam(required = false) Long modelId) {
        return Result.success(mappingService.getAllMappings(datasourceId, modelId));
    }

    @Operation(summary = "获取映射详情")
    @GetMapping("/{id}")
    public Result<MappingVO> getMapping(@PathVariable Long id) {
        return Result.success(mappingService.getMappingById(id));
    }

    @Operation(summary = "创建映射")
    @PostMapping
    public Result<MappingVO> createMapping(@Valid @RequestBody MappingCreateDTO dto) {
        return Result.success(mappingService.createMapping(dto));
    }

    @Operation(summary = "更新映射")
    @PutMapping("/{id}")
    public Result<MappingVO> updateMapping(@PathVariable Long id, @RequestBody MappingUpdateDTO dto) {
        return Result.success(mappingService.updateMapping(id, dto));
    }

    @Operation(summary = "删除映射")
    @DeleteMapping("/{id}")
    public Result<Void> deleteMapping(@PathVariable Long id) {
        return mappingService.deleteMapping(id)
                ? Result.success()
                : Result.error(404, "映射不存在");
    }

    @Operation(summary = "批量创建映射")
    @PostMapping("/batch")
    public Result<List<MappingVO>> batchCreateMappings(@RequestBody Map<String, Object> request) {
        Long datasourceId = Long.valueOf(request.get("datasourceId").toString());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> mappings = (List<Map<String, Object>>) request.get("mappings");
        return Result.success(mappingService.batchCreateMappings(datasourceId, mappings));
    }
}
