package com.jianmo.platform.dto.request;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DatasourceCreateDTO {
    @NotBlank(message = "数据源名称不能为空")
    private String name;

    @NotBlank(message = "数据源类型不能为空")
    private String type;

    @NotBlank(message = "连接URL不能为空")
    private String url;

    private String username;
    private String password;
    private String tableName;
    private String status = "inactive";
    private String description;
    private Long domainId;
}
