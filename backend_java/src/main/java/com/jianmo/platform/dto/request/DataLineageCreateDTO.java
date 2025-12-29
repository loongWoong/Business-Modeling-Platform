package com.jianmo.platform.dto.request;

import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DataLineageCreateDTO {
    @NotNull(message = "源模型ID不能为空")
    private Long sourceModelId;

    @NotNull(message = "目标模型ID不能为空")
    private Long targetModelId;

    private String sourceProperty;
    private String targetProperty;
    private String lineageType = "forward";
    private String transformation;
    private Long datasourceId;
    private Long etlTaskId;
    private String description;
    private Double confidenceScore = 1.0;
    private Boolean isAutoDiscovered = false;
}
