package com.jianmo.platform.repository;

import com.jianmo.platform.entity.ModelTableAssociation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelTableAssociationRepository extends JpaRepository<ModelTableAssociation, Long> {
    List<ModelTableAssociation> findByModelId(Long modelId);
    List<ModelTableAssociation> findByDatasourceId(Long datasourceId);
    Optional<ModelTableAssociation> findByModelIdAndDatasourceId(Long modelId, Long datasourceId);
}
