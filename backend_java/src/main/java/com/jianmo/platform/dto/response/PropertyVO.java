package com.jianmo.platform.dto.response;

import java.time.LocalDateTime;

public class PropertyVO {
    private Long id;
    private String name;
    private String code;
    private String type;
    private Long modelId;
    private Boolean isRequired;
    private String description;
    private Boolean isPrimaryKey;
    private Boolean isForeignKey;
    private String defaultValue;
    private String constraints;
    private String sensitivityLevel;
    private String maskRule;
    private String physicalColumn;
    private String foreignKeyTable;
    private String foreignKeyColumn;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Long getModelId() { return modelId; }
    public void setModelId(Long modelId) { this.modelId = modelId; }
    public Boolean getIsRequired() { return isRequired; }
    public void setIsRequired(Boolean isRequired) { this.isRequired = isRequired; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public Boolean getIsPrimaryKey() { return isPrimaryKey; }
    public void setIsPrimaryKey(Boolean isPrimaryKey) { this.isPrimaryKey = isPrimaryKey; }
    public Boolean getIsForeignKey() { return isForeignKey; }
    public void setIsForeignKey(Boolean isForeignKey) { this.isForeignKey = isForeignKey; }
    public String getDefaultValue() { return defaultValue; }
    public void setDefaultValue(String defaultValue) { this.defaultValue = defaultValue; }
    public String getConstraints() { return constraints; }
    public void setConstraints(String constraints) { this.constraints = constraints; }
    public String getSensitivityLevel() { return sensitivityLevel; }
    public void setSensitivityLevel(String sensitivityLevel) { this.sensitivityLevel = sensitivityLevel; }
    public String getMaskRule() { return maskRule; }
    public void setMaskRule(String maskRule) { this.maskRule = maskRule; }
    public String getPhysicalColumn() { return physicalColumn; }
    public void setPhysicalColumn(String physicalColumn) { this.physicalColumn = physicalColumn; }
    public String getForeignKeyTable() { return foreignKeyTable; }
    public void setForeignKeyTable(String foreignKeyTable) { this.foreignKeyTable = foreignKeyTable; }
    public String getForeignKeyColumn() { return foreignKeyColumn; }
    public void setForeignKeyColumn(String foreignKeyColumn) { this.foreignKeyColumn = foreignKeyColumn; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
