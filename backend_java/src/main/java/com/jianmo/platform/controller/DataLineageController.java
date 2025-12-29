package com.jianmo.platform.controller;

import com.jianmo.platform.dto.request.DataLineageCreateDTO;
import com.jianmo.platform.dto.response.DataLineageVO;
import com.jianmo.platform.service.DataLineageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "数据血缘管理", description = "数据血缘追踪相关API")
@RestController
@RequestMapping("/api/lineage")
public class DataLineageController {

    private final DataLineageService service;

    public DataLineageController(DataLineageService service) {
        this.service = service;
    }

    @Operation(summary = "获取模型的血缘关系")
    @GetMapping("/model/{modelId}")
    public List<DataLineageVO> getLineageByModel(
            @PathVariable Long modelId,
            @RequestParam(required = false) String type) {
        return service.getLineageByModelId(modelId, type);
    }

    @Operation(summary = "获取正向血缘（下游）")
    @GetMapping("/model/{modelId}/forward")
    public List<DataLineageVO> getForwardLineage(@PathVariable Long modelId) {
        return service.getForwardLineage(modelId);
    }

    @Operation(summary = "获取反向血缘（上游）")
    @GetMapping("/model/{modelId}/reverse")
    public List<DataLineageVO> getReverseLineage(@PathVariable Long modelId) {
        return service.getReverseLineage(modelId);
    }

    @Operation(summary = "获取端到端血缘")
    @GetMapping("/model/{modelId}/end-to-end")
    public List<DataLineageVO> getEndToEndLineage(@PathVariable Long modelId) {
        return service.getEndToEndLineage(modelId);
    }

    @Operation(summary = "创建血缘关系")
    @PostMapping
    public DataLineageVO createLineage(@RequestBody DataLineageCreateDTO dto) {
        return service.createLineage(dto);
    }

    @Operation(summary = "删除血缘关系")
    @DeleteMapping("/{id}")
    public void deleteLineage(@PathVariable Long id) {
        service.deleteLineage(id);
    }
}
