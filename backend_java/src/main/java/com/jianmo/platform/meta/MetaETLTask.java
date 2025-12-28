package com.jianmo.platform.meta;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaETLTask {
    private String code;
    private String name;
    private String description;
    private String sourceType;
    private String targetType;
    private String transformationType;
    private boolean supportsScheduling;
    private String scheduleFormat;
}
