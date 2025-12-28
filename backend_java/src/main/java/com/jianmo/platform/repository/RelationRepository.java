package com.jianmo.platform.repository;

import com.jianmo.platform.entity.Relation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RelationRepository extends JpaRepository<Relation, Long> {
    List<Relation> findBySourceModelId(Long modelId);
    List<Relation> findByTargetModelId(Long modelId);
    List<Relation> findBySourceModelIdOrTargetModelId(Long sourceId, Long targetId);
    void deleteBySourceModelId(Long modelId);
    void deleteByTargetModelId(Long modelId);
}
