package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class SharedAttributeVO {
    private Long id;
    private String code;
    private String name;
    private String type;
    private Long domainId;
    private String description;
    private Boolean isRequired;
    private String defaultValue;
    private Integer minLength;
    private Integer maxLength;
    private String pattern;
    private String sensitivityLevel;
    private String maskRule;
    private String usedByModels;
    private String updatedAt;
}
