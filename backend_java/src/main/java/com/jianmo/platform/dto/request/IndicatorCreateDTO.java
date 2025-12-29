package com.jianmo.platform.dto.request;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class IndicatorCreateDTO {
    @NotBlank(message = "指标编码不能为空")
    private String code;

    @NotBlank(message = "指标名称不能为空")
    private String name;

    @NotBlank(message = "计算表达式不能为空")
    private String expression;

    private Long domainId;
    private String description;
    private String returnType = "number";
    private String unit;
    private String dimensions;
    private String filters;
    private String sortFields;
    private String relatedProperties;
    private String status = "draft";
    private String creator;
}
