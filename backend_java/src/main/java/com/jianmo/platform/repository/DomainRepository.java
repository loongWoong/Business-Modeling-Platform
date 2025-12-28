package com.jianmo.platform.repository;

import com.jianmo.platform.entity.Domain;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DomainRepository extends JpaRepository<Domain, Long> {
    Optional<Domain> findByName(String name);
    List<Domain> findByOwner(String owner);
    boolean existsByCode(String code);
    boolean existsByName(String name);
}
