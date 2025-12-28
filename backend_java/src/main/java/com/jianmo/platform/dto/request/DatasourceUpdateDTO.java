package com.jianmo.platform.dto.request;

import lombok.Data;

@Data
public class DatasourceUpdateDTO {
    private String name;
    private String type;
    private String url;
    private String username;
    private String password;
    private String tableName;
    private String description;
}
