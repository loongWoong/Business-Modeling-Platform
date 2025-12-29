package com.jianmo.platform.repository;

import com.jianmo.platform.entity.Function;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FunctionRepository extends JpaRepository<Function, Long> {
    Optional<Function> findByCode(String code);
    List<Function> findByDomainId(Long domainId);
    List<Function> findByFunctionType(String functionType);
    List<Function> findByStatus(String status);
    boolean existsByCode(String code);
}
