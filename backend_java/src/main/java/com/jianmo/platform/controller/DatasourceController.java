package com.jianmo.platform.controller;

import com.jianmo.platform.dto.request.DatasourceCreateDTO;
import com.jianmo.platform.dto.request.DatasourceUpdateDTO;
import com.jianmo.platform.dto.request.MappingCreateDTO;
import com.jianmo.platform.dto.response.DatasourceDetailVO;
import com.jianmo.platform.dto.response.DatasourceVO;
import com.jianmo.platform.dto.response.MappingVO;
import com.jianmo.platform.service.DatasourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    public List<DatasourceVO> getDatasources(@RequestParam(required = false) Long domainId) {
        return datasourceService.getAllDatasources(domainId);
    }

    @Operation(summary = "获取数据源详情")
    @GetMapping("/{id}")
    public DatasourceDetailVO getDatasource(@PathVariable Long id) {
        return datasourceService.getDatasourceById(id);
    }

    @Operation(summary = "创建数据源")
    @PostMapping
    public DatasourceVO createDatasource(@RequestBody DatasourceCreateDTO dto) {
        return datasourceService.createDatasource(dto);
    }

    @Operation(summary = "更新数据源")
    @PutMapping("/{id}")
    public DatasourceVO updateDatasource(@PathVariable Long id, @RequestBody DatasourceUpdateDTO dto) {
        return datasourceService.updateDatasource(id, dto);
    }

    @Operation(summary = "删除数据源")
    @DeleteMapping("/{id}")
    public void deleteDatasource(@PathVariable Long id) {
        datasourceService.deleteDatasource(id);
    }

    @Operation(summary = "切换数据源状态")
    @PostMapping("/{id}/toggle-status")
    public DatasourceVO toggleStatus(@PathVariable Long id) {
        return datasourceService.toggleStatus(id);
    }

    @Operation(summary = "测试数据源连接")
    @PostMapping("/{id}/test")
    public Boolean testConnection(@PathVariable Long id) {
        return datasourceService.testConnection(id);
    }

    @Operation(summary = "获取数据源表列表")
    @GetMapping("/{id}/tables")
    public List<String> getTables(@PathVariable Long id) {
        return datasourceService.getTables(id);
    }

    @Operation(summary = "获取表数据")
    @GetMapping("/{id}/tables/{tableName}/data")
    public List<List<Object>> getTableData(@PathVariable Long id, @PathVariable String tableName) {
        return datasourceService.getTableData(id, tableName);
    }

    @Operation(summary = "添加关联")
    @PostMapping("/{datasourceId}/associations")
    public void addAssociation(@PathVariable Long datasourceId, @RequestBody Object associationData) {
        datasourceService.addAssociation(datasourceId, associationData);
    }

    @Operation(summary = "获取全局目标ID")
    @GetMapping("/global-target-id")
    public Long getGlobalTargetId() {
        return datasourceService.getGlobalTargetId();
    }

    @Operation(summary = "添加字段映射")
    @PostMapping("/{datasourceId}/mappings")
    public MappingVO addMapping(@PathVariable Long datasourceId, @RequestBody MappingCreateDTO dto) {
        return datasourceService.addMapping(datasourceId, dto);
    }

    @Operation(summary = "获取字段映射列表")
    @GetMapping("/{datasourceId}/mappings")
    public List<MappingVO> getMappings(@PathVariable Long datasourceId) {
        return datasourceService.getMappings(datasourceId);
    }
}
