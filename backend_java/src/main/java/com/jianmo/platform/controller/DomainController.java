package com.jianmo.platform.controller;

import com.jianmo.platform.common.Result;
import com.jianmo.platform.dto.request.DomainCreateDTO;
import com.jianmo.platform.dto.request.DomainUpdateDTO;
import com.jianmo.platform.dto.response.DomainVO;
import com.jianmo.platform.service.DomainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "领域管理", description = "领域分类相关API")
@RestController
@RequestMapping("/api/domain")
public class DomainController {

    private final DomainService domainService;

    public DomainController(DomainService domainService) {
        this.domainService = domainService;
    }

    @Operation(summary = "获取所有领域")
    @GetMapping
    public Result<List<DomainVO>> getAllDomains() {
        return Result.success(domainService.getAllDomains());
    }

    @Operation(summary = "获取领域详情")
    @GetMapping("/{id}")
    public Result<DomainVO> getDomain(@PathVariable Long id) {
        return Result.success(domainService.getDomainById(id));
    }

    @Operation(summary = "创建领域")
    @PostMapping
    public Result<DomainVO> createDomain(@Valid @RequestBody DomainCreateDTO dto) {
        return Result.success(domainService.createDomain(dto));
    }

    @Operation(summary = "更新领域")
    @PutMapping("/{id}")
    public Result<DomainVO> updateDomain(@PathVariable Long id, @RequestBody DomainUpdateDTO dto) {
        return Result.success(domainService.updateDomain(id, dto));
    }

    @Operation(summary = "删除领域")
    @DeleteMapping("/{id}")
    public Result<Void> deleteDomain(@PathVariable Long id) {
        return domainService.deleteDomain(id)
                ? Result.success()
                : Result.error(404, "领域不存在");
    }
}
