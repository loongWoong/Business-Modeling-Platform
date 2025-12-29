package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.IndicatorCreateDTO;
import com.jianmo.platform.dto.response.IndicatorVO;

import java.util.List;

public interface IndicatorService {
    List<IndicatorVO> getAllIndicators(Long domainId);
    IndicatorVO getIndicatorById(Long id);
    IndicatorVO createIndicator(IndicatorCreateDTO dto);
    IndicatorVO updateIndicator(Long id, IndicatorCreateDTO dto);
    boolean deleteIndicator(Long id);
}
