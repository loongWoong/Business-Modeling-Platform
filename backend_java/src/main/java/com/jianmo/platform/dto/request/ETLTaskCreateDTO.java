package com.jianmo.platform.dto.request;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ETLTaskCreateDTO {
    @NotBlank(message = "任务名称不能为空")
    private String name;

    @NotNull(message = "源数据源ID不能为空")
    private Long sourceDatasourceId;

    @NotNull(message = "目标模型ID不能为空")
    private Long targetModelId;

    private String description;
    private String status = "inactive";
    private String schedule;
    private String config;
}
