package com.jianmo.platform.repository;

import com.jianmo.platform.entity.Property;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PropertyRepository extends JpaRepository<Property, Long> {
    List<Property> findByModelId(Long modelId);
    Optional<Property> findByModelIdAndCode(Long modelId, String code);
    List<Property> findByModelIdAndCodeIn(Long modelId, List<String> codes);
    boolean existsByModelIdAndCode(Long modelId, String code);
    void deleteByModelId(Long modelId);
}
