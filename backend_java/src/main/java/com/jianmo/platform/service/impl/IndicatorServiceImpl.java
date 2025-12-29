package com.jianmo.platform.service.impl;

import com.jianmo.platform.dto.request.IndicatorCreateDTO;
import com.jianmo.platform.dto.response.IndicatorVO;
import com.jianmo.platform.entity.Indicator;
import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.repository.IndicatorRepository;
import com.jianmo.platform.service.IndicatorService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IndicatorServiceImpl implements IndicatorService {

    private final IndicatorRepository repository;

    public IndicatorServiceImpl(IndicatorRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<IndicatorVO> getAllIndicators(Long domainId) {
        List<Indicator> indicators = (domainId != null)
                ? repository.findByDomainId(domainId)
                : repository.findAll();
        return indicators.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public IndicatorVO getIndicatorById(Long id) {
        return repository.findById(id)
                .map(this::convertToVO)
                .orElseThrow(() -> new BusinessException("指标不存在: " + id));
    }

    @Override
    @Transactional
    public IndicatorVO createIndicator(IndicatorCreateDTO dto) {
        if (repository.existsByCode(dto.getCode())) {
            throw new BusinessException("指标编码已存在: " + dto.getCode());
        }

        Indicator indicator = new Indicator();
        indicator.setCode(dto.getCode());
        indicator.setName(dto.getName());
        indicator.setDomainId(dto.getDomainId());
        indicator.setDescription(dto.getDescription());
        indicator.setExpression(dto.getExpression());
        indicator.setReturnType(dto.getReturnType() != null ? dto.getReturnType() : "number");
        indicator.setUnit(dto.getUnit());
        indicator.setDimensions(dto.getDimensions());
        indicator.setFilters(dto.getFilters());
        indicator.setSortFields(dto.getSortFields());
        indicator.setRelatedProperties(dto.getRelatedProperties());
        indicator.setStatus(dto.getStatus() != null ? dto.getStatus() : "draft");
        indicator.setCreator(dto.getCreator());
        indicator.setCreatedAt(LocalDateTime.now());
        indicator.setUpdatedAt(LocalDateTime.now());

        repository.save(indicator);
        return convertToVO(indicator);
    }

    @Override
    @Transactional
    public IndicatorVO updateIndicator(Long id, IndicatorCreateDTO dto) {
        Indicator indicator = repository.findById(id)
                .orElseThrow(() -> new BusinessException("指标不存在: " + id));

        if (dto.getName() != null) indicator.setName(dto.getName());
        if (dto.getDescription() != null) indicator.setDescription(dto.getDescription());
        if (dto.getExpression() != null) indicator.setExpression(dto.getExpression());
        if (dto.getReturnType() != null) indicator.setReturnType(dto.getReturnType());
        if (dto.getUnit() != null) indicator.setUnit(dto.getUnit());
        if (dto.getDimensions() != null) indicator.setDimensions(dto.getDimensions());
        if (dto.getFilters() != null) indicator.setFilters(dto.getFilters());
        if (dto.getSortFields() != null) indicator.setSortFields(dto.getSortFields());
        if (dto.getRelatedProperties() != null) indicator.setRelatedProperties(dto.getRelatedProperties());
        if (dto.getStatus() != null) indicator.setStatus(dto.getStatus());
        indicator.setUpdatedAt(LocalDateTime.now());

        repository.save(indicator);
        return convertToVO(indicator);
    }

    @Override
    @Transactional
    public boolean deleteIndicator(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    private IndicatorVO convertToVO(Indicator indicator) {
        IndicatorVO vo = new IndicatorVO();
        vo.setId(indicator.getId());
        vo.setCode(indicator.getCode());
        vo.setName(indicator.getName());
        vo.setDomainId(indicator.getDomainId());
        vo.setDescription(indicator.getDescription());
        vo.setExpression(indicator.getExpression());
        vo.setReturnType(indicator.getReturnType());
        vo.setUnit(indicator.getUnit());
        vo.setDimensions(indicator.getDimensions());
        vo.setFilters(indicator.getFilters());
        vo.setSortFields(indicator.getSortFields());
        vo.setRelatedProperties(indicator.getRelatedProperties());
        vo.setStatus(indicator.getStatus());
        vo.setCreator(indicator.getCreator());
        vo.setUpdatedAt(indicator.getUpdatedAt() != null ? indicator.getUpdatedAt().toString() : null);
        return vo;
    }
}
