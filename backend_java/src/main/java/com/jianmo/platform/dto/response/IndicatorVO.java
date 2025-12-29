package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class IndicatorVO {
    private Long id;
    private String code;
    private String name;
    private Long domainId;
    private String description;
    private String expression;
    private String returnType;
    private String unit;
    private String dimensions;
    private String filters;
    private String sortFields;
    private String relatedProperties;
    private String status;
    private String creator;
    private String updatedAt;
}
