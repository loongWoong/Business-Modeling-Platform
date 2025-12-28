package com.jianmo.platform.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ETLTaskDetailVO {
    private ETLTaskVO task;
    private List<ETLLogVO> logs;
}
