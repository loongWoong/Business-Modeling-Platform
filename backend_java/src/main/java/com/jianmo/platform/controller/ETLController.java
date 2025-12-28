package com.jianmo.platform.controller;

import com.jianmo.platform.common.Result;
import com.jianmo.platform.dto.request.ETLTaskCreateDTO;
import com.jianmo.platform.dto.response.ETLTaskDetailVO;
import com.jianmo.platform.dto.response.ETLTaskVO;
import com.jianmo.platform.service.ETLService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import javax.validation.Valid;
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
    public Result<List<ETLTaskVO>> getAllTasks() {
        return Result.success(etlService.getAllTasks());
    }

    @Operation(summary = "获取ETL任务详情")
    @GetMapping("/tasks/{id}")
    public Result<ETLTaskDetailVO> getTask(@PathVariable Long id) {
        return Result.success(etlService.getTaskById(id));
    }

    @Operation(summary = "创建ETL任务")
    @PostMapping("/tasks")
    public Result<ETLTaskVO> createTask(@Valid @RequestBody ETLTaskCreateDTO dto) {
        return Result.success(etlService.createTask(dto));
    }

    @Operation(summary = "激活ETL任务")
    @PostMapping("/tasks/{id}/activate")
    public Result<ETLTaskVO> activateTask(@PathVariable Long id) {
        return Result.success(etlService.activateTask(id));
    }

    @Operation(summary = "暂停ETL任务")
    @PostMapping("/tasks/{id}/pause")
    public Result<ETLTaskVO> pauseTask(@PathVariable Long id) {
        return Result.success(etlService.pauseTask(id));
    }

    @Operation(summary = "启动ETL任务执行")
    @PostMapping("/tasks/{id}/start")
    public Result<ETLTaskVO> startTask(@PathVariable Long id) {
        return Result.success(etlService.startTask(id));
    }

    @Operation(summary = "完成ETL任务")
    @PostMapping("/tasks/{id}/complete")
    public Result<ETLTaskVO> completeTask(@PathVariable Long id) {
        return Result.success(etlService.completeTask(id));
    }

    @Operation(summary = "删除ETL任务")
    @DeleteMapping("/tasks/{id}")
    public Result<Void> deleteTask(@PathVariable Long id) {
        return etlService.deleteTask(id)
                ? Result.success()
                : Result.error(404, "ETL任务不存在");
    }
}
