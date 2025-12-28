package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class DomainVO {
    private Long id;
    private String name;
    private String description;
    private String owner;
    private String updatedAt;
}
