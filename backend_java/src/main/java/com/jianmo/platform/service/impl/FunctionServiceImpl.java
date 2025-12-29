package com.jianmo.platform.service.impl;

import com.jianmo.platform.dto.request.FunctionCreateDTO;
import com.jianmo.platform.dto.response.FunctionVO;
import com.jianmo.platform.entity.Function;
import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.repository.FunctionRepository;
import com.jianmo.platform.service.FunctionService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FunctionServiceImpl implements FunctionService {

    private final FunctionRepository repository;

    public FunctionServiceImpl(FunctionRepository repository) {
        this.repository = repository;
    }

    @Override
    public List<FunctionVO> getAllFunctions(Long domainId) {
        List<Function> functions = (domainId != null)
                ? repository.findByDomainId(domainId)
                : repository.findAll();
        return functions.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public FunctionVO getFunctionById(Long id) {
        return repository.findById(id)
                .map(this::convertToVO)
                .orElseThrow(() -> new BusinessException("函数不存在: " + id));
    }

    @Override
    @Transactional
    public FunctionVO createFunction(FunctionCreateDTO dto) {
        if (repository.existsByCode(dto.getCode())) {
            throw new BusinessException("函数编码已存在: " + dto.getCode());
        }

        Function function = new Function();
        function.setCode(dto.getCode());
        function.setName(dto.getName());
        function.setDomainId(dto.getDomainId());
        function.setDescription(dto.getDescription());
        function.setFunctionType(dto.getFunctionType());
        function.setImplementation(dto.getImplementation());
        function.setParameters(dto.getParameters());
        function.setReturnType(dto.getReturnType());
        function.setUsageExamples(dto.getUsageExamples());
        function.setStatus(dto.getStatus() != null ? dto.getStatus() : "draft");
        function.setCreator(dto.getCreator());
        function.setCreatedAt(LocalDateTime.now());
        function.setUpdatedAt(LocalDateTime.now());

        repository.save(function);
        return convertToVO(function);
    }

    @Override
    @Transactional
    public FunctionVO updateFunction(Long id, FunctionCreateDTO dto) {
        Function function = repository.findById(id)
                .orElseThrow(() -> new BusinessException("函数不存在: " + id));

        if (dto.getName() != null) function.setName(dto.getName());
        if (dto.getDescription() != null) function.setDescription(dto.getDescription());
        if (dto.getFunctionType() != null) function.setFunctionType(dto.getFunctionType());
        if (dto.getImplementation() != null) function.setImplementation(dto.getImplementation());
        if (dto.getParameters() != null) function.setParameters(dto.getParameters());
        if (dto.getReturnType() != null) function.setReturnType(dto.getReturnType());
        if (dto.getUsageExamples() != null) function.setUsageExamples(dto.getUsageExamples());
        if (dto.getStatus() != null) function.setStatus(dto.getStatus());
        function.setUpdatedAt(LocalDateTime.now());

        repository.save(function);
        return convertToVO(function);
    }

    @Override
    @Transactional
    public boolean deleteFunction(Long id) {
        if (!repository.existsById(id)) {
            return false;
        }
        repository.deleteById(id);
        return true;
    }

    private FunctionVO convertToVO(Function function) {
        FunctionVO vo = new FunctionVO();
        vo.setId(function.getId());
        vo.setCode(function.getCode());
        vo.setName(function.getName());
        vo.setDomainId(function.getDomainId());
        vo.setDescription(function.getDescription());
        vo.setFunctionType(function.getFunctionType());
        vo.setImplementation(function.getImplementation());
        vo.setParameters(function.getParameters());
        vo.setReturnType(function.getReturnType());
        vo.setUsageExamples(function.getUsageExamples());
        vo.setStatus(function.getStatus());
        vo.setCreator(function.getCreator());
        vo.setUpdatedAt(function.getUpdatedAt() != null ? function.getUpdatedAt().toString() : null);
        return vo;
    }
}
