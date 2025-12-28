package com.jianmo.platform.dto.response;

import lombok.Data;

import java.util.List;

@Data
public class ModelDetailVO {
    private ModelVO model;
    private List<PropertyVO> properties;
    private List<RelationVO> relations;
}
