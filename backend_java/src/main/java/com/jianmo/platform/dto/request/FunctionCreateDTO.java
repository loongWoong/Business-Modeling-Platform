package com.jianmo.platform.dto.request;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class FunctionCreateDTO {
    @NotBlank(message = "函数编码不能为空")
    private String code;

    @NotBlank(message = "函数名称不能为空")
    private String name;

    @NotBlank(message = "函数实现不能为空")
    private String implementation;

    private Long domainId;
    private String description;
    private String functionType;
    private String parameters;
    private String returnType;
    private String usageExamples;
    private String status = "draft";
    private String creator;
}
