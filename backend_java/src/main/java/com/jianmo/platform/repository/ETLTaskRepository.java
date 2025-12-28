package com.jianmo.platform.repository;

import com.jianmo.platform.entity.ETLTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ETLTaskRepository extends JpaRepository<ETLTask, Long> {
    List<ETLTask> findByStatus(String status);
    List<ETLTask> findBySourceDatasourceId(Long datasourceId);
    List<ETLTask> findByTargetModelId(Long modelId);
    Optional<ETLTask> findByName(String name);
}
