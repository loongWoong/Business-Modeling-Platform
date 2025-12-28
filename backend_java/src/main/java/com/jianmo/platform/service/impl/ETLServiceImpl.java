package com.jianmo.platform.service.impl;

import com.jianmo.platform.dto.request.ETLTaskCreateDTO;
import com.jianmo.platform.dto.response.ETLTaskDetailVO;
import com.jianmo.platform.dto.response.ETLTaskVO;
import com.jianmo.platform.entity.ETLLog;
import com.jianmo.platform.entity.ETLTask;
import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.repository.ETLTaskRepository;
import com.jianmo.platform.repository.ETLLogRepository;
import com.jianmo.platform.service.ETLService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ETLServiceImpl implements ETLService {

    private final ETLTaskRepository etlTaskRepository;
    private final ETLLogRepository etlLogRepository;

    public ETLServiceImpl(ETLTaskRepository etlTaskRepository, ETLLogRepository etlLogRepository) {
        this.etlTaskRepository = etlTaskRepository;
        this.etlLogRepository = etlLogRepository;
    }

    @Override
    public List<ETLTaskVO> getAllTasks() {
        return etlTaskRepository.findAll().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public ETLTaskDetailVO getTaskById(Long id) {
        ETLTask task = etlTaskRepository.findById(id)
                .orElseThrow(() -> new BusinessException("ETL任务不存在: " + id));

        List<ETLLog> logs = etlLogRepository.findByTaskIdOrderByStartTimeDesc(id);

        ETLTaskDetailVO vo = new ETLTaskDetailVO();
        vo.setTask(convertToVO(task));
        vo.setLogs(logs.stream().map(this::convertToLogVO).collect(Collectors.toList()));
        return vo;
    }

    @Override
    @Transactional
    public ETLTaskVO createTask(ETLTaskCreateDTO dto) {
        ETLTask task = new ETLTask();
        task.setName(dto.getName());
        task.setSourceDatasourceId(dto.getSourceDatasourceId());
        task.setTargetModelId(dto.getTargetModelId());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus() != null ? dto.getStatus() : "inactive");
        task.setSchedule(dto.getSchedule());
        task.setConfig(dto.getConfig());
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());

        etlTaskRepository.save(task);

        return convertToVO(task);
    }

    @Override
    @Transactional
    public ETLTaskVO activateTask(Long id) {
        ETLTask task = etlTaskRepository.findById(id)
                .orElseThrow(() -> new BusinessException("ETL任务不存在: " + id));

        if (!task.activate()) {
            throw new BusinessException("无法激活任务，当前状态: " + task.getStatus());
        }

        task.setUpdatedAt(LocalDateTime.now());
        etlTaskRepository.save(task);

        return convertToVO(task);
    }

    @Override
    @Transactional
    public ETLTaskVO pauseTask(Long id) {
        ETLTask task = etlTaskRepository.findById(id)
                .orElseThrow(() -> new BusinessException("ETL任务不存在: " + id));

        if (!task.pause()) {
            throw new BusinessException("无法暂停任务，当前状态: " + task.getStatus());
        }

        task.setUpdatedAt(LocalDateTime.now());
        etlTaskRepository.save(task);

        return convertToVO(task);
    }

    @Override
    @Transactional
    public ETLTaskVO startTask(Long id) {
        ETLTask task = etlTaskRepository.findById(id)
                .orElseThrow(() -> new BusinessException("ETL任务不存在: " + id));

        if (!task.start()) {
            throw new BusinessException("无法启动任务，当前状态: " + task.getStatus());
        }

        task.setUpdatedAt(LocalDateTime.now());
        etlTaskRepository.save(task);

        return convertToVO(task);
    }

    @Override
    @Transactional
    public ETLTaskVO completeTask(Long id) {
        ETLTask task = etlTaskRepository.findById(id)
                .orElseThrow(() -> new BusinessException("ETL任务不存在: " + id));

        if (!task.complete()) {
            throw new BusinessException("无法完成任务，当前状态: " + task.getStatus());
        }

        task.setUpdatedAt(LocalDateTime.now());
        etlTaskRepository.save(task);

        return convertToVO(task);
    }

    @Override
    @Transactional
    public boolean deleteTask(Long id) {
        if (!etlTaskRepository.existsById(id)) {
            return false;
        }
        etlLogRepository.deleteByTaskId(id);
        etlTaskRepository.deleteById(id);
        return true;
    }

    private ETLTaskVO convertToVO(ETLTask task) {
        ETLTaskVO vo = new ETLTaskVO();
        vo.setId(task.getId());
        vo.setName(task.getName());
        vo.setSourceDatasourceId(task.getSourceDatasourceId());
        vo.setTargetModelId(task.getTargetModelId());
        vo.setDescription(task.getDescription());
        vo.setStatus(task.getStatus());
        vo.setSchedule(task.getSchedule());
        vo.setLastRun(task.getLastRun());
        vo.setNextRun(task.getNextRun());
        vo.setUpdatedAt(task.getUpdatedAt() != null ? task.getUpdatedAt().toString() : null);
        return vo;
    }

    private ETLTaskVO convertToLogVO(ETLLog log) {
        ETLTaskVO vo = new ETLTaskVO();
        vo.setId(log.getId());
        vo.setStatus(log.getStatus());
        return vo;
    }
}
