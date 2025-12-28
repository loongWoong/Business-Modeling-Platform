package com.jianmo.platform.service.impl;

import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.dto.request.MappingCreateDTO;
import com.jianmo.platform.dto.request.MappingUpdateDTO;
import com.jianmo.platform.dto.response.MappingVO;
import com.jianmo.platform.entity.Datasource;
import com.jianmo.platform.entity.Mapping;
import com.jianmo.platform.entity.Model;
import com.jianmo.platform.entity.Property;
import com.jianmo.platform.repository.DatasourceRepository;
import com.jianmo.platform.repository.MappingRepository;
import com.jianmo.platform.repository.ModelRepository;
import com.jianmo.platform.repository.PropertyRepository;
import com.jianmo.platform.service.MappingService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MappingServiceImpl implements MappingService {

    private final MappingRepository mappingRepository;
    private final DatasourceRepository datasourceRepository;
    private final ModelRepository modelRepository;
    private final PropertyRepository propertyRepository;

    public MappingServiceImpl(MappingRepository mappingRepository, DatasourceRepository datasourceRepository, 
                             ModelRepository modelRepository, PropertyRepository propertyRepository) {
        this.mappingRepository = mappingRepository;
        this.datasourceRepository = datasourceRepository;
        this.modelRepository = modelRepository;
        this.propertyRepository = propertyRepository;
    }

    @Override
    public List<MappingVO> getAllMappings(Long datasourceId, Long modelId) {
        List<Mapping> mappings;
        if (datasourceId != null && modelId != null) {
            mappings = mappingRepository.findByDatasourceId(datasourceId).stream()
                    .filter(m -> m.getModelId() != null && m.getModelId().equals(modelId))
                    .collect(Collectors.toList());
        } else if (datasourceId != null) {
            mappings = mappingRepository.findByDatasourceId(datasourceId);
        } else if (modelId != null) {
            mappings = mappingRepository.findByModelId(modelId);
        } else {
            mappings = mappingRepository.findAll();
        }
        return mappings.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public MappingVO getMappingById(Long id) {
        Mapping mapping = mappingRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "映射不存在"));
        return toVO(mapping);
    }

    @Override
    public MappingVO createMapping(MappingCreateDTO dto) {
        if (!datasourceRepository.existsById(dto.getDatasourceId())) {
            throw new BusinessException(400, "数据源不存在");
        }
        if (!modelRepository.existsById(dto.getModelId())) {
            throw new BusinessException(400, "模型不存在");
        }
        if (dto.getPropertyId() != null && !propertyRepository.existsById(dto.getPropertyId())) {
            throw new BusinessException(400, "属性不存在");
        }
        Mapping mapping = new Mapping();
        mapping.setDatasourceId(dto.getDatasourceId());
        mapping.setModelId(dto.getModelId());
        mapping.setFieldId(dto.getFieldId());
        mapping.setPropertyId(dto.getPropertyId());
        Mapping saved = mappingRepository.save(mapping);
        return toVO(saved);
    }

    @Override
    public MappingVO updateMapping(Long id, MappingUpdateDTO dto) {
        Mapping mapping = mappingRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "映射不存在"));
        if (dto.getFieldId() != null) mapping.setFieldId(dto.getFieldId());
        if (dto.getPropertyId() != null) mapping.setPropertyId(dto.getPropertyId());
        Mapping saved = mappingRepository.save(mapping);
        return toVO(saved);
    }

    @Override
    public boolean deleteMapping(Long id) {
        if (!mappingRepository.existsById(id)) {
            return false;
        }
        mappingRepository.deleteById(id);
        return true;
    }

    @Override
    public List<MappingVO> batchCreateMappings(Long datasourceId, List<Map<String, Object>> mappings) {
        if (!datasourceRepository.existsById(datasourceId)) {
            throw new BusinessException(400, "数据源不存在");
        }
        List<MappingVO> result = new ArrayList<>();
        for (Map<String, Object> map : mappings) {
            Mapping mapping = new Mapping();
            mapping.setDatasourceId(datasourceId);
            mapping.setModelId(Long.valueOf(map.get("modelId").toString()));
            mapping.setFieldId(map.get("fieldId").toString());
            if (map.get("propertyId") != null) {
                mapping.setPropertyId(Long.valueOf(map.get("propertyId").toString()));
            }
            Mapping saved = mappingRepository.save(mapping);
            result.add(toVO(saved));
        }
        return result;
    }

    private MappingVO toVO(Mapping mapping) {
        MappingVO vo = new MappingVO();
        vo.setId(mapping.getId());
        vo.setDatasourceId(mapping.getDatasourceId());
        vo.setModelId(mapping.getModelId());
        vo.setFieldId(mapping.getFieldId());
        vo.setPropertyId(mapping.getPropertyId());
        vo.setCreatedAt(mapping.getCreatedAt());
        vo.setUpdatedAt(mapping.getUpdatedAt());
        return vo;
    }
}
