package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.MappingCreateDTO;
import com.jianmo.platform.dto.request.MappingUpdateDTO;
import com.jianmo.platform.dto.response.MappingVO;

import java.util.List;
import java.util.Map;

public interface MappingService {
    List<MappingVO> getAllMappings(Long datasourceId, Long modelId);
    MappingVO getMappingById(Long id);
    MappingVO createMapping(MappingCreateDTO dto);
    MappingVO updateMapping(Long id, MappingUpdateDTO dto);
    boolean deleteMapping(Long id);
    List<MappingVO> batchCreateMappings(Long datasourceId, List<Map<String, Object>> mappings);
}
