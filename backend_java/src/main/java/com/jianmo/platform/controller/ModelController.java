package com.jianmo.platform.controller;

import com.jianmo.platform.common.Result;
import com.jianmo.platform.dto.request.ModelCreateDTO;
import com.jianmo.platform.dto.request.ModelUpdateDTO;
import com.jianmo.platform.dto.request.PropertyCreateDTO;
import com.jianmo.platform.dto.request.RelationCreateDTO;
import com.jianmo.platform.dto.response.GraphVO;
import com.jianmo.platform.dto.response.ModelDetailVO;
import com.jianmo.platform.dto.response.ModelVO;
import com.jianmo.platform.dto.response.PropertyVO;
import com.jianmo.platform.dto.response.RelationVO;
import com.jianmo.platform.service.ModelService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "模型管理", description = "业务模型相关API")
@RestController
@RequestMapping("/api/model")
public class ModelController {

    private final ModelService modelService;

    public ModelController(ModelService modelService) {
        this.modelService = modelService;
    }

    @Operation(summary = "获取所有模型")
    @GetMapping
    public Result<GraphVO> getModels(@RequestParam(required = false) Long domainId) {
        return Result.success(modelService.getAllModels(domainId));
    }

    @Operation(summary = "获取模型详情")
    @GetMapping("/{id}")
    public Result<ModelDetailVO> getModel(@PathVariable Long id) {
        return Result.success(modelService.getModelById(id));
    }

    @Operation(summary = "创建模型")
    @PostMapping
    public Result<ModelVO> createModel(@Valid @RequestBody ModelCreateDTO dto) {
        return Result.success(modelService.createModel(dto));
    }

    @Operation(summary = "更新模型")
    @PutMapping("/{id}")
    public Result<ModelVO> updateModel(@PathVariable Long id, @RequestBody ModelUpdateDTO dto) {
        return Result.success(modelService.updateModel(id, dto));
    }

    @Operation(summary = "删除模型")
    @DeleteMapping("/{id}")
    public Result<Void> deleteModel(@PathVariable Long id) {
        return modelService.deleteModel(id)
                ? Result.success()
                : Result.error(404, "模型不存在");
    }

    @Operation(summary = "添加属性")
    @PostMapping("/{modelId}/properties")
    public Result<PropertyVO> addProperty(@PathVariable Long modelId, @Valid @RequestBody PropertyCreateDTO dto) {
        return Result.success(modelService.addProperty(modelId, dto));
    }

    @Operation(summary = "删除属性")
    @DeleteMapping("/{modelId}/properties/{propertyId}")
    public Result<Void> removeProperty(@PathVariable Long modelId, @PathVariable Long propertyId) {
        return modelService.removeProperty(modelId, propertyId)
                ? Result.success()
                : Result.error(404, "属性不存在");
    }

    @Operation(summary = "添加关系")
    @PostMapping("/relations")
    public Result<RelationVO> addRelation(@Valid @RequestBody RelationCreateDTO dto) {
        return Result.success(modelService.addRelation(dto));
    }

    @Operation(summary = "删除关系")
    @DeleteMapping("/relations/{relationId}")
    public Result<Void> removeRelation(@PathVariable Long relationId) {
        return modelService.removeRelation(relationId)
                ? Result.success()
                : Result.error(404, "关系不存在");
    }

    @Operation(summary = "根据领域获取模型")
    @GetMapping("/domain/{domainId}")
    public Result<List<ModelVO>> getModelsByDomain(@PathVariable Long domainId) {
        return Result.success(modelService.getModelsByDomainId(domainId));
    }
}
