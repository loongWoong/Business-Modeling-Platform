package com.jianmo.platform.controller;

import com.jianmo.platform.common.Result;
import com.jianmo.platform.dto.request.RelationCreateDTO;
import com.jianmo.platform.dto.request.RelationUpdateDTO;
import com.jianmo.platform.dto.response.RelationVO;
import com.jianmo.platform.service.RelationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "关系管理", description = "模型关系相关API")
@RestController
@RequestMapping("/api/relation")
public class RelationController {

    private final RelationService relationService;

    public RelationController(RelationService relationService) {
        this.relationService = relationService;
    }

    @Operation(summary = "获取所有关系")
    @GetMapping
    public Result<List<RelationVO>> getAllRelations(
            @RequestParam(required = false) Long domainId,
            @RequestParam(required = false) Long modelId) {
        return Result.success(relationService.getAllRelations(domainId, modelId));
    }

    @Operation(summary = "获取关系详情")
    @GetMapping("/{id}")
    public Result<RelationVO> getRelation(@PathVariable Long id) {
        return Result.success(relationService.getRelationById(id));
    }

    @Operation(summary = "创建关系")
    @PostMapping
    public Result<RelationVO> createRelation(@Valid @RequestBody RelationCreateDTO dto) {
        return Result.success(relationService.createRelation(dto));
    }

    @Operation(summary = "更新关系")
    @PutMapping("/{id}")
    public Result<RelationVO> updateRelation(@PathVariable Long id, @RequestBody RelationUpdateDTO dto) {
        return Result.success(relationService.updateRelation(id, dto));
    }

    @Operation(summary = "删除关系")
    @DeleteMapping("/{id}")
    public Result<Void> deleteRelation(@PathVariable Long id) {
        return relationService.deleteRelation(id)
                ? Result.success()
                : Result.error(404, "关系不存在");
    }

    @Operation(summary = "切换关系状态")
    @PutMapping("/{id}/toggle")
    public Result<RelationVO> toggleRelation(@PathVariable Long id) {
        return Result.success(relationService.toggleRelation(id));
    }
}
