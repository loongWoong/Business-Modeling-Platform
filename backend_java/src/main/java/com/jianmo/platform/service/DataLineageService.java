package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.DataLineageCreateDTO;
import com.jianmo.platform.dto.response.DataLineageVO;

import java.util.List;

public interface DataLineageService {
    List<DataLineageVO> getLineageByModelId(Long modelId, String lineageType);
    List<DataLineageVO> getForwardLineage(Long modelId);
    List<DataLineageVO> getReverseLineage(Long modelId);
    List<DataLineageVO> getEndToEndLineage(Long modelId);
    DataLineageVO createLineage(DataLineageCreateDTO dto);
    boolean deleteLineage(Long id);
}
