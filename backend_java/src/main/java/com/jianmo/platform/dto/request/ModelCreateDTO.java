package com.jianmo.platform.dto.request;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ModelCreateDTO {
    @NotBlank(message = "模型名称不能为空")
    private String name;

    @NotBlank(message = "模型编码不能为空")
    private String code;

    private String description;
    private String creator;
    private Long domainId;
}
