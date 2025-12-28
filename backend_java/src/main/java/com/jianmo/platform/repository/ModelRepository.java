package com.jianmo.platform.repository;

import com.jianmo.platform.entity.Model;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ModelRepository extends JpaRepository<Model, Long> {
    Optional<Model> findByCode(String code);
    List<Model> findByDomainId(Long domainId);
    boolean existsByCode(String code);
}
