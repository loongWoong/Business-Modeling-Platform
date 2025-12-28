package com.jianmo.platform.dto.request;

import javax.validation.constraints.NotNull;

public class RelationCreateDTO {
    private String name;

    @NotNull(message = "源模型ID不能为空")
    private Long sourceModelId;

    @NotNull(message = "目标模型ID不能为空")
    private Long targetModelId;

    private String type = "one-to-many";
    private String description;
    private Boolean isEnabled = true;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public Long getSourceModelId() { return sourceModelId; }
    public void setSourceModelId(Long sourceModelId) { this.sourceModelId = sourceModelId; }
    public Long getTargetModelId() { return targetModelId; }
    public void setTargetModelId(Long targetModelId) { this.targetModelId = targetModelId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsEnabled() { return isEnabled; }
    public void setIsEnabled(Boolean isEnabled) { this.isEnabled = isEnabled; }
}
