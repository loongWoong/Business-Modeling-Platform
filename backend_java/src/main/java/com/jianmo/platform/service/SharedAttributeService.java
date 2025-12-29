package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.SharedAttributeCreateDTO;
import com.jianmo.platform.dto.response.SharedAttributeVO;

import java.util.List;

public interface SharedAttributeService {
    List<SharedAttributeVO> getAllSharedAttributes(Long domainId);
    SharedAttributeVO getSharedAttributeById(Long id);
    SharedAttributeVO createSharedAttribute(SharedAttributeCreateDTO dto);
    SharedAttributeVO updateSharedAttribute(Long id, SharedAttributeCreateDTO dto);
    boolean deleteSharedAttribute(Long id);
}
