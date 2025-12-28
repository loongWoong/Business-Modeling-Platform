package com.jianmo.platform.controller;

import com.jianmo.platform.common.Result;
import com.jianmo.platform.dto.request.DatasourceCreateDTO;
import com.jianmo.platform.dto.request.DatasourceUpdateDTO;
import com.jianmo.platform.dto.request.MappingCreateDTO;
import com.jianmo.platform.dto.response.DatasourceDetailVO;
import com.jianmo.platform.dto.response.DatasourceVO;
import com.jianmo.platform.dto.response.MappingVO;
import com.jianmo.platform.service.DatasourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "数据源管理", description = "数据源相关API")
@RestController
@RequestMapping("/api/datasource")
public class DatasourceController {

    private final DatasourceService datasourceService;

    public DatasourceController(DatasourceService datasourceService) {
        this.datasourceService = datasourceService;
    }

    @Operation(summary = "获取所有数据源")
    @GetMapping
    public Result<List<DatasourceVO>> getDatasources(@RequestParam(required = false) Long domainId) {
        return Result.success(datasourceService.getAllDatasources(domainId));
    }

    @Operation(summary = "获取数据源详情")
    @GetMapping("/{id}")
    public Result<DatasourceDetailVO> getDatasource(@PathVariable Long id) {
        return Result.success(datasourceService.getDatasourceById(id));
    }

    @Operation(summary = "创建数据源")
    @PostMapping
    public Result<DatasourceVO> createDatasource(@Valid @RequestBody DatasourceCreateDTO dto) {
        return Result.success(datasourceService.createDatasource(dto));
    }

    @Operation(summary = "更新数据源")
    @PutMapping("/{id}")
    public Result<DatasourceVO> updateDatasource(@PathVariable Long id, @RequestBody DatasourceUpdateDTO dto) {
        return Result.success(datasourceService.updateDatasource(id, dto));
    }

    @Operation(summary = "删除数据源")
    @DeleteMapping("/{id}")
    public Result<Void> deleteDatasource(@PathVariable Long id) {
        return datasourceService.deleteDatasource(id)
                ? Result.success()
                : Result.error(404, "数据源不存在");
    }

    @Operation(summary = "切换数据源状态")
    @PostMapping("/{id}/toggle-status")
    public Result<DatasourceVO> toggleStatus(@PathVariable Long id) {
        return Result.success(datasourceService.toggleStatus(id));
    }

    @Operation(summary = "测试数据源连接")
    @PostMapping("/{id}/test")
    public Result<Boolean> testConnection(@PathVariable Long id) {
        return Result.success(datasourceService.testConnection(id));
    }

    @Operation(summary = "获取数据源表列表")
    @GetMapping("/{id}/tables")
    public Result<List<String>> getTables(@PathVariable Long id) {
        return Result.success(datasourceService.getTables(id));
    }

    @Operation(summary = "获取表数据")
    @GetMapping("/{id}/tables/{tableName}/data")
    public Result<List<List<Object>>> getTableData(@PathVariable Long id, @PathVariable String tableName) {
        return Result.success(datasourceService.getTableData(id, tableName));
    }

    @Operation(summary = "添加关联")
    @PostMapping("/{datasourceId}/associations")
    public Result<Void> addAssociation(@PathVariable Long datasourceId, @RequestBody Object associationData) {
        datasourceService.addAssociation(datasourceId, associationData);
        return Result.success();
    }

    @Operation(summary = "获取全局目标ID")
    @GetMapping("/global-target-id")
    public Result<Long> getGlobalTargetId() {
        return Result.success(datasourceService.getGlobalTargetId());
    }

    @Operation(summary = "添加字段映射")
    @PostMapping("/{datasourceId}/mappings")
    public Result<MappingVO> addMapping(@PathVariable Long datasourceId, @Valid @RequestBody MappingCreateDTO dto) {
        return Result.success(datasourceService.addMapping(datasourceId, dto));
    }

    @Operation(summary = "获取字段映射列表")
    @GetMapping("/{datasourceId}/mappings")
    public Result<List<MappingVO>> getMappings(@PathVariable Long datasourceId) {
        return Result.success(datasourceService.getMappings(datasourceId));
    }
}
