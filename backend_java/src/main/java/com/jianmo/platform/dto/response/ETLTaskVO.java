package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class ETLTaskVO {
    private Long id;
    private String name;
    private Long sourceDatasourceId;
    private Long targetModelId;
    private String description;
    private String status;
    private String schedule;
    private String lastRun;
    private String nextRun;
    private String updatedAt;
}
