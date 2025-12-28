package com.jianmo.platform.controller;

import com.jianmo.platform.dto.request.ETLTaskCreateDTO;
import com.jianmo.platform.dto.response.ETLTaskDetailVO;
import com.jianmo.platform.dto.response.ETLTaskVO;
import com.jianmo.platform.service.ETLService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "ETL任务管理", description = "ETL任务相关API")
@RestController
@RequestMapping("/api/etl")
public class ETLController {

    private final ETLService etlService;

    public ETLController(ETLService etlService) {
        this.etlService = etlService;
    }

    @Operation(summary = "获取所有ETL任务")
    @GetMapping("/tasks")
    public List<ETLTaskVO> getAllTasks() {
        return etlService.getAllTasks();
    }

    @Operation(summary = "获取ETL任务详情")
    @GetMapping("/tasks/{id}")
    public ETLTaskDetailVO getTask(@PathVariable Long id) {
        return etlService.getTaskById(id);
    }

    @Operation(summary = "创建ETL任务")
    @PostMapping("/tasks")
    public ETLTaskVO createTask(@RequestBody ETLTaskCreateDTO dto) {
        return etlService.createTask(dto);
    }

    @Operation(summary = "激活ETL任务")
    @PostMapping("/tasks/{id}/activate")
    public ETLTaskVO activateTask(@PathVariable Long id) {
        return etlService.activateTask(id);
    }

    @Operation(summary = "暂停ETL任务")
    @PostMapping("/tasks/{id}/pause")
    public ETLTaskVO pauseTask(@PathVariable Long id) {
        return etlService.pauseTask(id);
    }

    @Operation(summary = "启动ETL任务执行")
    @PostMapping("/tasks/{id}/start")
    public ETLTaskVO startTask(@PathVariable Long id) {
        return etlService.startTask(id);
    }

    @Operation(summary = "完成ETL任务")
    @PostMapping("/tasks/{id}/complete")
    public ETLTaskVO completeTask(@PathVariable Long id) {
        return etlService.completeTask(id);
    }

    @Operation(summary = "删除ETL任务")
    @DeleteMapping("/tasks/{id}")
    public void deleteTask(@PathVariable Long id) {
        etlService.deleteTask(id);
    }
}
