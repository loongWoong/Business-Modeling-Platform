package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class DatasourceVO {
    private Long id;
    private String name;
    private String type;
    private String url;
    private String status;
    private Long domainId;
    private String tableName;
    private String description;
    private String updatedAt;
}
