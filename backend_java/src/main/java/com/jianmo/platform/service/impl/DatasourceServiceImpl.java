package com.jianmo.platform.service.impl;

import com.jianmo.platform.dto.request.DatasourceCreateDTO;
import com.jianmo.platform.dto.request.DatasourceUpdateDTO;
import com.jianmo.platform.dto.request.MappingCreateDTO;
import com.jianmo.platform.dto.response.DatasourceDetailVO;
import com.jianmo.platform.dto.response.DatasourceVO;
import com.jianmo.platform.dto.response.MappingVO;
import com.jianmo.platform.entity.Datasource;
import com.jianmo.platform.entity.Mapping;
import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.repository.DatasourceRepository;
import com.jianmo.platform.repository.MappingRepository;
import com.jianmo.platform.service.DatasourceService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DatasourceServiceImpl implements DatasourceService {

    private final DatasourceRepository datasourceRepository;
    private final MappingRepository mappingRepository;

    public DatasourceServiceImpl(DatasourceRepository datasourceRepository, MappingRepository mappingRepository) {
        this.datasourceRepository = datasourceRepository;
        this.mappingRepository = mappingRepository;
    }

    @Override
    public List<DatasourceVO> getAllDatasources(Long domainId) {
        List<Datasource> datasources = (domainId != null)
                ? datasourceRepository.findByDomainId(domainId)
                : datasourceRepository.findAll();

        return datasources.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public DatasourceDetailVO getDatasourceById(Long id) {
        Datasource datasource = datasourceRepository.findById(id)
                .orElseThrow(() -> new BusinessException("数据源不存在: " + id));

        List<Mapping> mappings = mappingRepository.findByDatasourceId(id);

        DatasourceDetailVO vo = new DatasourceDetailVO();
        vo.setDatasource(convertToVO(datasource));
        vo.setMappings(mappings.stream()
                .map(this::convertToMappingVO)
                .collect(Collectors.toList()));
        return vo;
    }

    @Override
    @Transactional
    public DatasourceVO createDatasource(DatasourceCreateDTO dto) {
        if (datasourceRepository.existsByName(dto.getName())) {
            throw new BusinessException("数据源名称已存在: " + dto.getName());
        }

        Datasource datasource = new Datasource();
        datasource.setName(dto.getName());
        datasource.setType(dto.getType());
        datasource.setUrl(dto.getUrl());
        datasource.setUsername(dto.getUsername());
        datasource.setPassword(dto.getPassword());
        datasource.setTableName(dto.getTableName());
        datasource.setStatus(dto.getStatus() != null ? dto.getStatus() : "inactive");
        datasource.setDescription(dto.getDescription());
        datasource.setDomainId(dto.getDomainId());
        datasource.setCreatedAt(LocalDateTime.now());
        datasource.setUpdatedAt(LocalDateTime.now());

        datasourceRepository.save(datasource);

        return convertToVO(datasource);
    }

    @Override
    @Transactional
    public DatasourceVO updateDatasource(Long id, DatasourceUpdateDTO dto) {
        Datasource datasource = datasourceRepository.findById(id)
                .orElseThrow(() -> new BusinessException("数据源不存在: " + id));

        if (dto.getName() != null) {
            datasource.setName(dto.getName());
        }
        if (dto.getType() != null) {
            datasource.setType(dto.getType());
        }
        if (dto.getUrl() != null) {
            datasource.setUrl(dto.getUrl());
        }
        if (dto.getUsername() != null) {
            datasource.setUsername(dto.getUsername());
        }
        if (dto.getPassword() != null) {
            datasource.setPassword(dto.getPassword());
        }
        if (dto.getTableName() != null) {
            datasource.setTableName(dto.getTableName());
        }
        if (dto.getDescription() != null) {
            datasource.setDescription(dto.getDescription());
        }
        datasource.setUpdatedAt(LocalDateTime.now());

        datasourceRepository.save(datasource);

        return convertToVO(datasource);
    }

    @Override
    @Transactional
    public boolean deleteDatasource(Long id) {
        if (!datasourceRepository.existsById(id)) {
            return false;
        }
        mappingRepository.findByDatasourceId(id).forEach(m ->
            mappingRepository.deleteById(m.getId())
        );
        datasourceRepository.deleteById(id);
        return true;
    }

    @Override
    @Transactional
    public DatasourceVO toggleStatus(Long id) {
        Datasource datasource = datasourceRepository.findById(id)
                .orElseThrow(() -> new BusinessException("数据源不存在: " + id));

        datasource.toggleStatus();
        datasource.setUpdatedAt(LocalDateTime.now());

        datasourceRepository.save(datasource);

        return convertToVO(datasource);
    }

    @Override
    @Transactional
    public MappingVO addMapping(Long datasourceId, MappingCreateDTO dto) {
        Datasource datasource = datasourceRepository.findById(datasourceId)
                .orElseThrow(() -> new BusinessException("数据源不存在: " + datasourceId));

        Mapping mapping = new Mapping();
        mapping.setDatasourceId(datasourceId);
        mapping.setModelId(dto.getModelId());
        mapping.setFieldId(dto.getFieldId());
        mapping.setPropertyId(dto.getPropertyId());
        mapping.setCreatedAt(LocalDateTime.now());
        mapping.setUpdatedAt(LocalDateTime.now());

        mappingRepository.save(mapping);

        return convertToMappingVO(mapping);
    }

    @Override
    public List<MappingVO> getMappings(Long datasourceId) {
        return mappingRepository.findByDatasourceId(datasourceId).stream()
                .map(this::convertToMappingVO)
                .collect(Collectors.toList());
    }

    @Override
    public boolean testConnection(Long id) {
        return true;
    }

    @Override
    public List<String> getTables(Long id) {
        return new ArrayList<>(Arrays.asList("table1", "table2", "table3"));
    }

    @Override
    public List<List<Object>> getTableData(Long id, String tableName) {
        List<List<Object>> result = new ArrayList<>();
        result.add(new ArrayList<>(Arrays.asList("1", "test1", "value1")));
        result.add(new ArrayList<>(Arrays.asList("2", "test2", "value2")));
        return result;
    }

    @Override
    public void addAssociation(Long datasourceId, Object associationData) {
    }

    @Override
    public Long getGlobalTargetId() {
        return 1L;
    }

    private DatasourceVO convertToVO(Datasource datasource) {
        DatasourceVO vo = new DatasourceVO();
        vo.setId(datasource.getId());
        vo.setName(datasource.getName());
        vo.setType(datasource.getType());
        vo.setUrl(datasource.getUrl());
        vo.setStatus(datasource.getStatus());
        vo.setDomainId(datasource.getDomainId());
        vo.setTableName(datasource.getTableName());
        vo.setDescription(datasource.getDescription());
        vo.setUpdatedAt(datasource.getUpdatedAt() != null ? datasource.getUpdatedAt().toString() : null);
        return vo;
    }

    private MappingVO convertToMappingVO(Mapping mapping) {
        MappingVO vo = new MappingVO();
        vo.setId(mapping.getId());
        vo.setDatasourceId(mapping.getDatasourceId());
        vo.setModelId(mapping.getModelId());
        vo.setFieldId(mapping.getFieldId());
        vo.setPropertyId(mapping.getPropertyId());
        return vo;
    }
}
