package com.jianmo.platform.dto.response;

import lombok.Data;

@Data
public class ETLLogVO {
    private Long id;
    private Long taskId;
    private String status;
    private String startTime;
    private String endTime;
    private Integer recordsProcessed;
    private Integer recordsSuccess;
    private Integer recordsFailed;
    private String errorMessage;
    private String details;
}
