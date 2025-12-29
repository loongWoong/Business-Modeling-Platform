package com.jianmo.platform.service.impl;

import com.jianmo.platform.dto.request.DataLineageCreateDTO;
import com.jianmo.platform.dto.response.DataLineageVO;
import com.jianmo.platform.entity.DataLineage;
import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.repository.DataLineageRepository;
import com.jianmo.platform.service.DataLineageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DataLineageServiceImpl implements DataLineageService {

    private final DataLineageRepository repository;

    public DataLineageServiceImpl(DataLineageRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<DataLineageVO> getLineageByModelId(Long modelId, String lineageType) {
        List<DataLineage> lineages;
        if (lineageType != null) {
            lineages = repository.findBySourceModelIdAndLineageType(modelId, lineageType);
            lineages.addAll(repository.findByTargetModelIdAndLineageType(modelId, lineageType));
        } else {
            lineages = repository.findBySourceModelIdOrTargetModelId(modelId, modelId);
        }
        return lineages.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DataLineageVO> getForwardLineage(Long modelId) {
        return repository.findBySourceModelIdAndLineageType(modelId, "forward").stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DataLineageVO> getReverseLineage(Long modelId) {
        return repository.findByTargetModelIdAndLineageType(modelId, "reverse").stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public List<DataLineageVO> getEndToEndLineage(Long modelId) {
        return repository.findBySourceModelIdAndLineageType(modelId, "endToEnd").stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DataLineageVO createLineage(DataLineageCreateDTO dto) {
        if (dto.getSourceModelId().equals(dto.getTargetModelId())) {
            throw new BusinessException("源模型和目标模型不能相同");
        }

        DataLineage lineage = new DataLineage();
        lineage.setSourceModelId(dto.getSourceModelId());
        lineage.setTargetModelId(dto.getTargetModelId());
        lineage.setSourceProperty(dto.getSourceProperty());
        lineage.setTargetProperty(dto.getTargetProperty());
        lineage.setLineageType(dto.getLineageType() != null ? dto.getLineageType() : "forward");
        lineage.setTransformation(dto.getTransformation());
        lineage.setDatasourceId(dto.getDatasourceId());
        lineage.setEtlTaskId(dto.getEtlTaskId());
        lineage.setDescription(dto.getDescription());
        lineage.setConfidenceScore(dto.getConfidenceScore() != null ? dto.getConfidenceScore() : 1.0);
        lineage.setIsAutoDiscovered(dto.getIsAutoDiscovered() != null ? dto.getIsAutoDiscovered() : false);
        lineage.setCreatedAt(LocalDateTime.now());
        lineage.setUpdatedAt(LocalDateTime.now());

        repository.save(lineage);
        return convertToVO(lineage);
    }

    @Override
    @Transactional
    public boolean deleteLineage(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    private DataLineageVO convertToVO(DataLineage lineage) {
        DataLineageVO vo = new DataLineageVO();
        vo.setId(lineage.getId());
        vo.setSourceModelId(lineage.getSourceModelId());
        vo.setTargetModelId(lineage.getTargetModelId());
        vo.setSourceProperty(lineage.getSourceProperty());
        vo.setTargetProperty(lineage.getTargetProperty());
        vo.setLineageType(lineage.getLineageType());
        vo.setTransformation(lineage.getTransformation());
        vo.setDatasourceId(lineage.getDatasourceId());
        vo.setEtlTaskId(lineage.getEtlTaskId());
        vo.setDescription(lineage.getDescription());
        vo.setConfidenceScore(lineage.getConfidenceScore());
        vo.setIsAutoDiscovered(lineage.getIsAutoDiscovered());
        vo.setUpdatedAt(lineage.getUpdatedAt() != null ? lineage.getUpdatedAt().toString() : null);
        return vo;
    }
}
