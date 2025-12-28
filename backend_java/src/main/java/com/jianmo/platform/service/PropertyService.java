package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.PropertyCreateDTO;
import com.jianmo.platform.dto.request.PropertyUpdateDTO;
import com.jianmo.platform.dto.response.PropertyVO;

import java.util.List;

public interface PropertyService {
    List<PropertyVO> getAllProperties(Long modelId);
    PropertyVO getPropertyById(Long id);
    PropertyVO createProperty(PropertyCreateDTO dto);
    PropertyVO updateProperty(Long id, PropertyUpdateDTO dto);
    boolean deleteProperty(Long id);
}
