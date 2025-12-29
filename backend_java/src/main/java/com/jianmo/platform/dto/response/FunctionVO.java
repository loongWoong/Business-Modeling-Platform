package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class FunctionVO {
    private Long id;
    private String code;
    private String name;
    private Long domainId;
    private String description;
    private String functionType;
    private String implementation;
    private String parameters;
    private String returnType;
    private String usageExamples;
    private String status;
    private String creator;
    private String updatedAt;
}
