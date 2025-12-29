package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class DomainVO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String owner;
    private String domainType;
    private Boolean isActive;
    private Integer modelQuota;
    private String permissions;
    private String workspaceConfig;
    private String updatedAt;
}
