package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.FunctionCreateDTO;
import com.jianmo.platform.dto.response.FunctionVO;

import java.util.List;

public interface FunctionService {
    List<FunctionVO> getAllFunctions(Long domainId);
    FunctionVO getFunctionById(Long id);
    FunctionVO createFunction(FunctionCreateDTO dto);
    FunctionVO updateFunction(Long id, FunctionCreateDTO dto);
    boolean deleteFunction(Long id);
}
