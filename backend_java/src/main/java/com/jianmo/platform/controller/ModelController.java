package com.jianmo.platform.controller;

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
    public GraphVO getModels(@RequestParam(required = false) Long domainId) {
        return modelService.getAllModels(domainId);
    }

    @Operation(summary = "获取模型详情")
    @GetMapping("/{id}")
    public ModelDetailVO getModel(@PathVariable Long id) {
        return modelService.getModelById(id);
    }

    @Operation(summary = "创建模型")
    @PostMapping
    public ModelVO createModel(@RequestBody ModelCreateDTO dto) {
        return modelService.createModel(dto);
    }

    @Operation(summary = "更新模型")
    @PutMapping("/{id}")
    public ModelVO updateModel(@PathVariable Long id, @RequestBody ModelUpdateDTO dto) {
        return modelService.updateModel(id, dto);
    }

    @Operation(summary = "删除模型")
    @DeleteMapping("/{id}")
    public void deleteModel(@PathVariable Long id) {
        modelService.deleteModel(id);
    }

    @Operation(summary = "添加属性")
    @PostMapping("/{modelId}/properties")
    public PropertyVO addProperty(@PathVariable Long modelId, @RequestBody PropertyCreateDTO dto) {
        return modelService.addProperty(modelId, dto);
    }

    @Operation(summary = "删除属性")
    @DeleteMapping("/{modelId}/properties/{propertyId}")
    public void removeProperty(@PathVariable Long modelId, @PathVariable Long propertyId) {
        modelService.removeProperty(modelId, propertyId);
    }

    @Operation(summary = "添加关系")
    @PostMapping("/relations")
    public RelationVO addRelation(@RequestBody RelationCreateDTO dto) {
        return modelService.addRelation(dto);
    }

    @Operation(summary = "删除关系")
    @DeleteMapping("/relations/{relationId}")
    public void removeRelation(@PathVariable Long relationId) {
        modelService.removeRelation(relationId);
    }

    @Operation(summary = "根据领域获取模型")
    @GetMapping("/domain/{domainId}")
    public List<ModelVO> getModelsByDomain(@PathVariable Long domainId) {
        return modelService.getModelsByDomainId(domainId);
    }
}
