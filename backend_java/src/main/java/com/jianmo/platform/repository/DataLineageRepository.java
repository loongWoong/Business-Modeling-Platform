package com.jianmo.platform.repository;

import com.jianmo.platform.entity.DataLineage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DataLineageRepository extends JpaRepository<DataLineage, Long> {
    List<DataLineage> findBySourceModelId(Long sourceModelId);
    List<DataLineage> findByTargetModelId(Long targetModelId);
    List<DataLineage> findBySourceModelIdAndLineageType(Long sourceModelId, String lineageType);
    List<DataLineage> findByTargetModelIdAndLineageType(Long targetModelId, String lineageType);
    List<DataLineage> findBySourceModelIdOrTargetModelId(Long sourceModelId, Long targetModelId);
    List<DataLineage> findByEtlTaskId(Long etlTaskId);
}
