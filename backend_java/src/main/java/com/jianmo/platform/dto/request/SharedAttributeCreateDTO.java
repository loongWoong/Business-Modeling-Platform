package com.jianmo.platform.dto.request;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SharedAttributeCreateDTO {
    @NotBlank(message = "共享属性编码不能为空")
    private String code;

    @NotBlank(message = "共享属性名称不能为空")
    private String name;

    @NotBlank(message = "属性类型不能为空")
    private String type;

    private Long domainId;
    private String description;
    private Boolean isRequired = false;
    private String defaultValue;
    private Integer minLength;
    private Integer maxLength;
    private String pattern;
    private String sensitivityLevel;
    private String maskRule;
}
