package com.jianmo.platform.dto.response;

import java.time.LocalDateTime;

public class RelationVO {
    private Long id;
    private String name;
    private Long sourceModelId;
    private Long targetModelId;
    private String type;
    private String description;
    private Boolean isEnabled;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
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
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
