package com.jianmo.platform.controller;

import com.jianmo.platform.dto.request.MappingCreateDTO;
import com.jianmo.platform.dto.request.MappingUpdateDTO;
import com.jianmo.platform.dto.response.MappingVO;
import com.jianmo.platform.service.MappingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    public List<MappingVO> getAllMappings(
            @RequestParam(required = false) Long datasourceId,
            @RequestParam(required = false) Long modelId) {
        return mappingService.getAllMappings(datasourceId, modelId);
    }

    @Operation(summary = "获取映射详情")
    @GetMapping("/{id}")
    public MappingVO getMapping(@PathVariable Long id) {
        return mappingService.getMappingById(id);
    }

    @Operation(summary = "创建映射")
    @PostMapping
    public MappingVO createMapping(@RequestBody MappingCreateDTO dto) {
        return mappingService.createMapping(dto);
    }

    @Operation(summary = "更新映射")
    @PutMapping("/{id}")
    public MappingVO updateMapping(@PathVariable Long id, @RequestBody MappingUpdateDTO dto) {
        return mappingService.updateMapping(id, dto);
    }

    @Operation(summary = "删除映射")
    @DeleteMapping("/{id}")
    public void deleteMapping(@PathVariable Long id) {
        mappingService.deleteMapping(id);
    }

    @Operation(summary = "批量创建映射")
    @PostMapping("/batch")
    public List<MappingVO> batchCreateMappings(@RequestBody Map<String, Object> request) {
        Long datasourceId = Long.valueOf(request.get("datasourceId").toString());
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> mappings = (List<Map<String, Object>>) request.get("mappings");
        return mappingService.batchCreateMappings(datasourceId, mappings);
    }
}
