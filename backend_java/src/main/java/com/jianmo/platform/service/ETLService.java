package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.ETLTaskCreateDTO;
import com.jianmo.platform.dto.response.ETLTaskDetailVO;
import com.jianmo.platform.dto.response.ETLTaskVO;

import java.util.List;

public interface ETLService {
    List<ETLTaskVO> getAllTasks();
    ETLTaskDetailVO getTaskById(Long id);
    ETLTaskVO createTask(ETLTaskCreateDTO dto);
    ETLTaskVO activateTask(Long id);
    ETLTaskVO pauseTask(Long id);
    ETLTaskVO startTask(Long id);
    ETLTaskVO completeTask(Long id);
    boolean deleteTask(Long id);
}
