package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class AssociationVO {
    private Long id;
    private Long modelId;
    private Long datasourceId;
    private String tableName;
    private String status;
    private String createdAt;
    private String updatedAt;
}
