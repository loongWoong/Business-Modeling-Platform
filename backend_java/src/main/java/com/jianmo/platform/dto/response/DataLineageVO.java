package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class DataLineageVO {
    private Long id;
    private Long sourceModelId;
    private Long targetModelId;
    private String sourceProperty;
    private String targetProperty;
    private String lineageType;
    private String transformation;
    private Long datasourceId;
    private Long etlTaskId;
    private String description;
    private Double confidenceScore;
    private Boolean isAutoDiscovered;
    private String updatedAt;
}
