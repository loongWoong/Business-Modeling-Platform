package com.jianmo.platform.dto.request;

import javax.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class DomainCreateDTO {
    @NotBlank(message = "领域编码不能为空")
    private String code;

    @NotBlank(message = "领域名称不能为空")
    private String name;

    private String description;
    private String owner;
    private String domainType = "category";  // workspace 或 category
    private Boolean isActive = true;
    private Integer modelQuota;
    private String permissions;
    private String workspaceConfig;
}
