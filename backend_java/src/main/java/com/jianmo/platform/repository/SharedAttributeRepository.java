package com.jianmo.platform.repository;

import com.jianmo.platform.entity.SharedAttribute;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SharedAttributeRepository extends JpaRepository<SharedAttribute, Long> {
    Optional<SharedAttribute> findByCode(String code);
    List<SharedAttribute> findByDomainId(Long domainId);
    boolean existsByCode(String code);
}
