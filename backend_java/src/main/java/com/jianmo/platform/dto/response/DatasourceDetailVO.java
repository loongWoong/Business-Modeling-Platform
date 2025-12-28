package com.jianmo.platform.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class DatasourceDetailVO {
    private DatasourceVO datasource;
    private List<MappingVO> mappings;
    private List<AssociationVO> associations;
}
