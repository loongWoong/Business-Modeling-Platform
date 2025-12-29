package com.jianmo.platform.service.impl;

import com.jianmo.platform.dto.request.SharedAttributeCreateDTO;
import com.jianmo.platform.dto.response.SharedAttributeVO;
import com.jianmo.platform.entity.SharedAttribute;
import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.repository.SharedAttributeRepository;
import com.jianmo.platform.service.SharedAttributeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SharedAttributeServiceImpl implements SharedAttributeService {

    private final SharedAttributeRepository repository;

    public SharedAttributeServiceImpl(SharedAttributeRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<SharedAttributeVO> getAllSharedAttributes(Long domainId) {
        List<SharedAttribute> attributes = (domainId != null)
                ? repository.findByDomainId(domainId)
                : repository.findAll();
        return attributes.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public SharedAttributeVO getSharedAttributeById(Long id) {
        return repository.findById(id)
                .map(this::convertToVO)
                .orElseThrow(() -> new BusinessException("共享属性不存在: " + id));
    }

    @Override
    @Transactional
    public SharedAttributeVO createSharedAttribute(SharedAttributeCreateDTO dto) {
        if (repository.existsByCode(dto.getCode())) {
            throw new BusinessException("共享属性编码已存在: " + dto.getCode());
        }

        SharedAttribute attribute = new SharedAttribute();
        attribute.setCode(dto.getCode());
        attribute.setName(dto.getName());
        attribute.setType(dto.getType());
        attribute.setDomainId(dto.getDomainId());
        attribute.setDescription(dto.getDescription());
        attribute.setIsRequired(dto.getIsRequired());
        attribute.setDefaultValue(dto.getDefaultValue());
        attribute.setMinLength(dto.getMinLength());
        attribute.setMaxLength(dto.getMaxLength());
        attribute.setPattern(dto.getPattern());
        attribute.setSensitivityLevel(dto.getSensitivityLevel());
        attribute.setMaskRule(dto.getMaskRule());
        attribute.setCreatedAt(LocalDateTime.now());
        attribute.setUpdatedAt(LocalDateTime.now());

        repository.save(attribute);
        return convertToVO(attribute);
    }

    @Override
    @Transactional
    public SharedAttributeVO updateSharedAttribute(Long id, SharedAttributeCreateDTO dto) {
        SharedAttribute attribute = repository.findById(id)
                .orElseThrow(() -> new BusinessException("共享属性不存在: " + id));

        if (dto.getName() != null) attribute.setName(dto.getName());
        if (dto.getDescription() != null) attribute.setDescription(dto.getDescription());
        if (dto.getIsRequired() != null) attribute.setIsRequired(dto.getIsRequired());
        if (dto.getDefaultValue() != null) attribute.setDefaultValue(dto.getDefaultValue());
        if (dto.getMinLength() != null) attribute.setMinLength(dto.getMinLength());
        if (dto.getMaxLength() != null) attribute.setMaxLength(dto.getMaxLength());
        if (dto.getPattern() != null) attribute.setPattern(dto.getPattern());
        if (dto.getSensitivityLevel() != null) attribute.setSensitivityLevel(dto.getSensitivityLevel());
        if (dto.getMaskRule() != null) attribute.setMaskRule(dto.getMaskRule());
        attribute.setUpdatedAt(LocalDateTime.now());

        repository.save(attribute);
        return convertToVO(attribute);
    }

    @Override
    @Transactional
    public boolean deleteSharedAttribute(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    private SharedAttributeVO convertToVO(SharedAttribute attribute) {
        SharedAttributeVO vo = new SharedAttributeVO();
        vo.setId(attribute.getId());
        vo.setCode(attribute.getCode());
        vo.setName(attribute.getName());
        vo.setType(attribute.getType());
        vo.setDomainId(attribute.getDomainId());
        vo.setDescription(attribute.getDescription());
        vo.setIsRequired(attribute.getIsRequired());
        vo.setDefaultValue(attribute.getDefaultValue());
        vo.setMinLength(attribute.getMinLength());
        vo.setMaxLength(attribute.getMaxLength());
        vo.setPattern(attribute.getPattern());
        vo.setSensitivityLevel(attribute.getSensitivityLevel());
        vo.setMaskRule(attribute.getMaskRule());
        vo.setUsedByModels(attribute.getUsedByModels());
        vo.setUpdatedAt(attribute.getUpdatedAt() != null ? attribute.getUpdatedAt().toString() : null);
        return vo;
    }
}
