package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.ModelCreateDTO;
import com.jianmo.platform.dto.request.ModelUpdateDTO;
import com.jianmo.platform.dto.request.PropertyCreateDTO;
import com.jianmo.platform.dto.request.RelationCreateDTO;
import com.jianmo.platform.dto.response.GraphVO;
import com.jianmo.platform.dto.response.ModelDetailVO;
import com.jianmo.platform.dto.response.ModelVO;
import com.jianmo.platform.dto.response.PropertyVO;
import com.jianmo.platform.dto.response.RelationVO;

import java.util.List;

public interface ModelService {
    GraphVO getAllModels(Long domainId);
    ModelDetailVO getModelById(Long id);
    ModelVO createModel(ModelCreateDTO dto);
    ModelVO updateModel(Long id, ModelUpdateDTO dto);
    boolean deleteModel(Long id);
    PropertyVO addProperty(Long modelId, PropertyCreateDTO dto);
    boolean removeProperty(Long modelId, Long propertyId);
    RelationVO addRelation(RelationCreateDTO dto);
    boolean removeRelation(Long relationId);
    List<ModelVO> getModelsByDomainId(Long domainId);
}
