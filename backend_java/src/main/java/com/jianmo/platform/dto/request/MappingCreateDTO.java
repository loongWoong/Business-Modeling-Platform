package com.jianmo.platform.dto.request;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MappingCreateDTO {
    @NotNull(message = "数据源ID不能为空")
    private Long datasourceId;
    
    @NotNull(message = "模型ID不能为空")
    private Long modelId;

    @NotBlank(message = "源字段不能为空")
    private String fieldId;

    @NotNull(message = "目标属性ID不能为空")
    private Long propertyId;
}
