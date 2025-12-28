package com.jianmo.platform.meta;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaDomain {
    private String code;
    private String name;
    private String description;
    private String owner;
    private boolean active;
}
