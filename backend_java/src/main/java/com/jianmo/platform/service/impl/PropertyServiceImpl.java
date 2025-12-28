package com.jianmo.platform.service.impl;

import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.dto.request.PropertyCreateDTO;
import com.jianmo.platform.dto.request.PropertyUpdateDTO;
import com.jianmo.platform.dto.response.PropertyVO;
import com.jianmo.platform.entity.Property;
import com.jianmo.platform.repository.ModelRepository;
import com.jianmo.platform.repository.PropertyRepository;
import com.jianmo.platform.service.PropertyService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class PropertyServiceImpl implements PropertyService {

    private final PropertyRepository propertyRepository;
    private final ModelRepository modelRepository;

    public PropertyServiceImpl(PropertyRepository propertyRepository, ModelRepository modelRepository) {
        this.propertyRepository = propertyRepository;
        this.modelRepository = modelRepository;
    }

    @Override
    public List<PropertyVO> getAllProperties(Long modelId) {
        List<Property> properties;
        if (modelId != null) {
            properties = propertyRepository.findByModelId(modelId);
        } else {
            properties = propertyRepository.findAll();
        }
        return properties.stream().map(this::toVO).collect(Collectors.toList());
    }

    @Override
    public PropertyVO getPropertyById(Long id) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "属性不存在"));
        return toVO(property);
    }

    @Override
    public PropertyVO createProperty(PropertyCreateDTO dto) {
        if (!modelRepository.existsById(dto.getModelId())) {
            throw new BusinessException(400, "模型不存在");
        }
        if (propertyRepository.existsByModelIdAndCode(dto.getModelId(), dto.getCode())) {
            throw new BusinessException(400, "属性编码已存在");
        }
        Property property = new Property();
        property.setName(dto.getName());
        property.setCode(dto.getCode());
        property.setType(dto.getType());
        property.setModelId(dto.getModelId());
        property.setIsRequired(dto.getIsRequired() != null ? dto.getIsRequired() : false);
        property.setDescription(dto.getDescription());
        property.setIsPrimaryKey(dto.getIsPrimaryKey() != null ? dto.getIsPrimaryKey() : false);
        property.setIsForeignKey(dto.getIsForeignKey() != null ? dto.getIsForeignKey() : false);
        property.setDefaultValue(dto.getDefaultValue());
        property.setConstraints(dto.getConstraints());
        property.setSensitivityLevel(dto.getSensitivityLevel());
        property.setMaskRule(dto.getMaskRule());
        property.setPhysicalColumn(dto.getPhysicalColumn());
        property.setForeignKeyTable(dto.getForeignKeyTable());
        property.setForeignKeyColumn(dto.getForeignKeyColumn());
        Property saved = propertyRepository.save(property);
        return toVO(saved);
    }

    @Override
    public PropertyVO updateProperty(Long id, PropertyUpdateDTO dto) {
        Property property = propertyRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "属性不存在"));
        if (dto.getName() != null) property.setName(dto.getName());
        if (dto.getType() != null) property.setType(dto.getType());
        if (dto.getIsRequired() != null) property.setIsRequired(dto.getIsRequired());
        if (dto.getDescription() != null) property.setDescription(dto.getDescription());
        if (dto.getIsPrimaryKey() != null) property.setIsPrimaryKey(dto.getIsPrimaryKey());
        if (dto.getDefaultValue() != null) property.setDefaultValue(dto.getDefaultValue());
        if (dto.getConstraints() != null) property.setConstraints(dto.getConstraints());
        Property saved = propertyRepository.save(property);
        return toVO(saved);
    }

    @Override
    public boolean deleteProperty(Long id) {
        if (!propertyRepository.existsById(id)) {
            return false;
        }
        propertyRepository.deleteById(id);
        return true;
    }

    private PropertyVO toVO(Property property) {
        PropertyVO vo = new PropertyVO();
        vo.setId(property.getId());
        vo.setName(property.getName());
        vo.setCode(property.getCode());
        vo.setType(property.getType());
        vo.setModelId(property.getModelId());
        vo.setIsRequired(property.getIsRequired());
        vo.setDescription(property.getDescription());
        vo.setIsPrimaryKey(property.getIsPrimaryKey());
        vo.setIsForeignKey(property.getIsForeignKey());
        vo.setDefaultValue(property.getDefaultValue());
        vo.setConstraints(property.getConstraints());
        vo.setSensitivityLevel(property.getSensitivityLevel());
        vo.setMaskRule(property.getMaskRule());
        vo.setPhysicalColumn(property.getPhysicalColumn());
        vo.setForeignKeyTable(property.getForeignKeyTable());
        vo.setForeignKeyColumn(property.getForeignKeyColumn());
        vo.setCreatedAt(property.getCreatedAt());
        vo.setUpdatedAt(property.getUpdatedAt());
        return vo;
    }
}
