package com.jianmo.platform.controller;

import com.jianmo.platform.dto.request.SharedAttributeCreateDTO;
import com.jianmo.platform.dto.response.SharedAttributeVO;
import com.jianmo.platform.service.SharedAttributeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "共享属性管理", description = "语义层-共享属性相关API")
@RestController
@RequestMapping("/api/shared-attribute")
public class SharedAttributeController {

    private final SharedAttributeService service;

    public SharedAttributeController(SharedAttributeService service) {
        this.service = service;
    }

    @Operation(summary = "获取所有共享属性")
    @GetMapping
    public List<SharedAttributeVO> getAllSharedAttributes(@RequestParam(required = false) Long domainId) {
        return service.getAllSharedAttributes(domainId);
    }

    @Operation(summary = "获取共享属性详情")
    @GetMapping("/{id}")
    public SharedAttributeVO getSharedAttribute(@PathVariable Long id) {
        return service.getSharedAttributeById(id);
    }

    @Operation(summary = "创建共享属性")
    @PostMapping
    public SharedAttributeVO createSharedAttribute(@RequestBody SharedAttributeCreateDTO dto) {
        return service.createSharedAttribute(dto);
    }

    @Operation(summary = "更新共享属性")
    @PutMapping("/{id}")
    public SharedAttributeVO updateSharedAttribute(@PathVariable Long id, @RequestBody SharedAttributeCreateDTO dto) {
        return service.updateSharedAttribute(id, dto);
    }

    @Operation(summary = "删除共享属性")
    @DeleteMapping("/{id}")
    public void deleteSharedAttribute(@PathVariable Long id) {
        service.deleteSharedAttribute(id);
    }
}
