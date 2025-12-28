package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class ModelVO {
    private Long id;
    private String code;
    private String name;
    private String description;
    private String creator;
    private Long domainId;
    private String updatedAt;
}
