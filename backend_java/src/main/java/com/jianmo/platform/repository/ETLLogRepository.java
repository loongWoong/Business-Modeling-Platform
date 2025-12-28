package com.jianmo.platform.repository;

import com.jianmo.platform.entity.ETLLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ETLLogRepository extends JpaRepository<ETLLog, Long> {
    List<ETLLog> findByTaskIdOrderByStartTimeDesc(Long taskId);
    List<ETLLog> findTop10ByTaskIdOrderByStartTimeDesc(Long taskId);
    void deleteByTaskId(Long taskId);
}
