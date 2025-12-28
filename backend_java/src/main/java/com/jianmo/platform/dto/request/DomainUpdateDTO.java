package com.jianmo.platform.dto.request;

import lombok.Data;

@Data
public class DomainUpdateDTO {
    private String name;
    private String description;
    private String owner;
}
