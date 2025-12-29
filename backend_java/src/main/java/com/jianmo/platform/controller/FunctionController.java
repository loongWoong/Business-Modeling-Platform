package com.jianmo.platform.controller;

import com.jianmo.platform.dto.request.FunctionCreateDTO;
import com.jianmo.platform.dto.response.FunctionVO;
import com.jianmo.platform.service.FunctionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "函数管理", description = "语义层-函数相关API")
@RestController
@RequestMapping("/api/function")
public class FunctionController {

    private final FunctionService service;

    public FunctionController(FunctionService service) {
        this.service = service;
    }

    @Operation(summary = "获取所有函数")
    @GetMapping
    public List<FunctionVO> getAllFunctions(@RequestParam(required = false) Long domainId) {
        return service.getAllFunctions(domainId);
    }

    @Operation(summary = "获取函数详情")
    @GetMapping("/{id}")
    public FunctionVO getFunction(@PathVariable Long id) {
        return service.getFunctionById(id);
    }

    @Operation(summary = "创建函数")
    @PostMapping
    public FunctionVO createFunction(@RequestBody FunctionCreateDTO dto) {
        return service.createFunction(dto);
    }

    @Operation(summary = "更新函数")
    @PutMapping("/{id}")
    public FunctionVO updateFunction(@PathVariable Long id, @RequestBody FunctionCreateDTO dto) {
        return service.updateFunction(id, dto);
    }

    @Operation(summary = "删除函数")
    @DeleteMapping("/{id}")
    public void deleteFunction(@PathVariable Long id) {
        service.deleteFunction(id);
    }
}
