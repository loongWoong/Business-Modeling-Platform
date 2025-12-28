package com.jianmo.platform.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class MetaModelVO {
    private String code;
    private String name;
    private String description;
    private String type;
    private List<MetaPropertyVO> properties;
    private List<MetaRelationVO> relations;

    @Data
    public static class MetaPropertyVO {
        private String code;
        private String name;
        private String type;
        private Boolean required;
        private Boolean unique;
        private Integer maxLength;
    }

    @Data
    public static class MetaRelationVO {
        private String code;
        private String name;
        private String sourceModelCode;
        private String targetModelCode;
        private String type;
    }
}
