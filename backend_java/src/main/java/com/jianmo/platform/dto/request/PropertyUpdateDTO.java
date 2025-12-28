package com.jianmo.platform.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "属性更新DTO")
public class PropertyUpdateDTO {
    @Schema(description = "属性名称")
    private String name;
    
    @Schema(description = "属性类型")
    private String type;
    
    @Schema(description = "是否必填")
    private Boolean isRequired;
    
    @Schema(description = "属性描述")
    private String description;
    
    @Schema(description = "是否主键")
    private Boolean isPrimaryKey;
    
    @Schema(description = "默认值")
    private String defaultValue;
    
    @Schema(description = "约束条件")
    private String constraints;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Boolean getIsRequired() {
        return isRequired;
    }

    public void setIsRequired(Boolean isRequired) {
        this.isRequired = isRequired;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsPrimaryKey() {
        return isPrimaryKey;
    }

    public void setIsPrimaryKey(Boolean isPrimaryKey) {
        this.isPrimaryKey = isPrimaryKey;
    }

    public String getDefaultValue() {
        return defaultValue;
    }

    public void setDefaultValue(String defaultValue) {
        this.defaultValue = defaultValue;
    }

    public String getConstraints() {
        return constraints;
    }

    public void setConstraints(String constraints) {
        this.constraints = constraints;
    }
}
