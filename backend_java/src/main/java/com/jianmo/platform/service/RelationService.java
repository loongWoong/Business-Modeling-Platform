package com.jianmo.platform.service;

import com.jianmo.platform.dto.request.RelationCreateDTO;
import com.jianmo.platform.dto.request.RelationUpdateDTO;
import com.jianmo.platform.dto.response.RelationVO;

import java.util.List;

public interface RelationService {
    List<RelationVO> getAllRelations(Long domainId, Long modelId);
    RelationVO getRelationById(Long id);
    RelationVO createRelation(RelationCreateDTO dto);
    RelationVO updateRelation(Long id, RelationUpdateDTO dto);
    boolean deleteRelation(Long id);
    RelationVO toggleRelation(Long id);
}
