package com.jianmo.platform.repository;

import com.jianmo.platform.entity.Datasource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DatasourceRepository extends JpaRepository<Datasource, Long> {
    Optional<Datasource> findByName(String name);
    List<Datasource> findByType(String type);
    List<Datasource> findByStatus(String status);
    List<Datasource> findByDomainId(Long domainId);
    boolean existsByName(String name);
}
