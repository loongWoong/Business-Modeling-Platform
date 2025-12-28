package com.jianmo.platform.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "映射更新DTO")
public class MappingUpdateDTO {
    @Schema(description = "字段ID")
    private String fieldId;
    
    @Schema(description = "属性ID")
    private Long propertyId;

    public String getFieldId() {
        return fieldId;
    }

    public void setFieldId(String fieldId) {
        this.fieldId = fieldId;
    }

    public Long getPropertyId() {
        return propertyId;
    }

    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }
}
