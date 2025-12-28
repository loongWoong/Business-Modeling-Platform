package com.jianmo.platform.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import javax.validation.constraints.NotNull;

@Schema(description = "关系更新DTO")
public class RelationUpdateDTO {
    @Schema(description = "关系名称")
    private String name;
    
    @Schema(description = "关系类型")
    private String type;
    
    @Schema(description = "关系描述")
    private String description;
    
    @Schema(description = "是否启用")
    private Boolean isEnabled;

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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsEnabled() {
        return isEnabled;
    }

    public void setIsEnabled(Boolean isEnabled) {
        this.isEnabled = isEnabled;
    }
}
