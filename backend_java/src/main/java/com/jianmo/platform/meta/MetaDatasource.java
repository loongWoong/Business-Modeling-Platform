package com.jianmo.platform.meta;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaDatasource {
    private String code;
    private String name;
    private String description;
    private DatasourceType type;
    private String urlTemplate;
    private String driverClassName;
    private boolean requiresCredentials;
    private boolean supportsBatch;
}
