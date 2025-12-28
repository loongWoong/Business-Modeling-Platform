package com.jianmo.platform.meta;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaRelation {
    private String code;
    private String name;
    private String sourceModelCode;
    private String targetModelCode;
    private RelationType type;
    private boolean bidirectional;
    private String description;
    private Map<String, Object> metadata;

    public boolean involvesModel(String modelCode) {
        return (sourceModelCode != null && sourceModelCode.equals(modelCode)) ||
               (targetModelCode != null && targetModelCode.equals(modelCode));
    }

    public boolean isValid() {
        return sourceModelCode != null && !sourceModelCode.isEmpty() &&
               targetModelCode != null && !targetModelCode.isEmpty();
    }
}
