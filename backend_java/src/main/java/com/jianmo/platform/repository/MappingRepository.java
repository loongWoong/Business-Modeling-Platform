package com.jianmo.platform.repository;

import com.jianmo.platform.entity.Mapping;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MappingRepository extends JpaRepository<Mapping, Long> {
    List<Mapping> findByDatasourceId(Long datasourceId);
    List<Mapping> findByModelId(Long modelId);
    List<Mapping> findByPropertyId(Long propertyId);
    Optional<Mapping> findByDatasourceIdAndPropertyId(Long datasourceId, Long propertyId);
}
