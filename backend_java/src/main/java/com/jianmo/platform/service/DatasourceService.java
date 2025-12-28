package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.DatasourceCreateDTO;
import com.jianmo.platform.dto.request.DatasourceUpdateDTO;
import com.jianmo.platform.dto.request.MappingCreateDTO;
import com.jianmo.platform.dto.response.DatasourceDetailVO;
import com.jianmo.platform.dto.response.DatasourceVO;
import com.jianmo.platform.dto.response.MappingVO;

import java.util.List;

public interface DatasourceService {
    List<DatasourceVO> getAllDatasources(Long domainId);
    DatasourceDetailVO getDatasourceById(Long id);
    DatasourceVO createDatasource(DatasourceCreateDTO dto);
    DatasourceVO updateDatasource(Long id, DatasourceUpdateDTO dto);
    boolean deleteDatasource(Long id);
    DatasourceVO toggleStatus(Long id);
    MappingVO addMapping(Long datasourceId, MappingCreateDTO dto);
    List<MappingVO> getMappings(Long datasourceId);
    boolean testConnection(Long id);
    List<String> getTables(Long id);
    List<List<Object>> getTableData(Long id, String tableName);
    void addAssociation(Long datasourceId, Object associationData);
    Long getGlobalTargetId();
}
