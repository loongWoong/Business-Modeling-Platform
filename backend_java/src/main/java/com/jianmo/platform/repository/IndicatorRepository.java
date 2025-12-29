package com.jianmo.platform.repository;

import com.jianmo.platform.entity.Indicator;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface IndicatorRepository extends JpaRepository<Indicator, Long> {
    Optional<Indicator> findByCode(String code);
    List<Indicator> findByDomainId(Long domainId);
    List<Indicator> findByStatus(String status);
    boolean existsByCode(String code);
}
