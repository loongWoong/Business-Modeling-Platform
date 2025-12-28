package com.jianmo.platform.controller;

import com.jianmo.platform.dto.request.RelationCreateDTO;
import com.jianmo.platform.dto.request.RelationUpdateDTO;
import com.jianmo.platform.dto.response.RelationVO;
import com.jianmo.platform.service.RelationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
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
    public List<RelationVO> getAllRelations(
            @RequestParam(required = false) Long domainId,
            @RequestParam(required = false) Long modelId) {
        return relationService.getAllRelations(domainId, modelId);
    }

    @Operation(summary = "获取关系详情")
    @GetMapping("/{id}")
    public RelationVO getRelation(@PathVariable Long id) {
        return relationService.getRelationById(id);
    }

    @Operation(summary = "创建关系")
    @PostMapping
    public RelationVO createRelation(@RequestBody RelationCreateDTO dto) {
        return relationService.createRelation(dto);
    }

    @Operation(summary = "更新关系")
    @PutMapping("/{id}")
    public RelationVO updateRelation(@PathVariable Long id, @RequestBody RelationUpdateDTO dto) {
        return relationService.updateRelation(id, dto);
    }

    @Operation(summary = "删除关系")
    @DeleteMapping("/{id}")
    public void deleteRelation(@PathVariable Long id) {
        relationService.deleteRelation(id);
    }

    @Operation(summary = "切换关系状态")
    @PutMapping("/{id}/toggle")
    public RelationVO toggleRelation(@PathVariable Long id) {
        return relationService.toggleRelation(id);
    }
}
