package com.jianmo.platform.service.impl;

import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.dto.request.RelationCreateDTO;
import com.jianmo.platform.dto.request.RelationUpdateDTO;
import com.jianmo.platform.dto.response.RelationVO;
import com.jianmo.platform.entity.Relation;
import com.jianmo.platform.repository.ModelRepository;
import com.jianmo.platform.repository.RelationRepository;
import com.jianmo.platform.utils.BeanCopyUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class RelationServiceImpl implements com.jianmo.platform.service.RelationService {

    private final RelationRepository relationRepository;
    private final ModelRepository modelRepository;

    public RelationServiceImpl(RelationRepository relationRepository, ModelRepository modelRepository) {
        this.relationRepository = relationRepository;
        this.modelRepository = modelRepository;
    }

    @Override
    public List<RelationVO> getAllRelations(Long domainId, Long modelId) {
        List<Relation> relations;
        if (modelId != null) {
            relations = relationRepository.findBySourceModelIdOrTargetModelId(modelId, modelId);
        } else {
            relations = relationRepository.findAll();
        }
        return relations.stream()
                .map(this::toVO)
                .collect(Collectors.toList());
    }

    @Override
    public RelationVO getRelationById(Long id) {
        Relation relation = relationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "关系不存在"));
        return toVO(relation);
    }

    @Override
    public RelationVO createRelation(RelationCreateDTO dto) {
        if (!modelRepository.existsById(dto.getSourceModelId())) {
            throw new BusinessException(400, "源模型不存在");
        }
        if (!modelRepository.existsById(dto.getTargetModelId())) {
            throw new BusinessException(400, "目标模型不存在");
        }
        Relation relation = new Relation();
        relation.setName(dto.getName());
        relation.setSourceModelId(dto.getSourceModelId());
        relation.setTargetModelId(dto.getTargetModelId());
        relation.setType(dto.getType());
        relation.setDescription(dto.getDescription());
        Boolean enabled = dto.getIsEnabled();
        relation.setEnabled(enabled != null ? enabled : true);
        Relation saved = relationRepository.save(relation);
        return toVO(saved);
    }

    @Override
    public RelationVO updateRelation(Long id, RelationUpdateDTO dto) {
        Relation relation = relationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "关系不存在"));
        if (dto.getName() != null) relation.setName(dto.getName());
        if (dto.getType() != null) relation.setType(dto.getType());
        if (dto.getDescription() != null) relation.setDescription(dto.getDescription());
        if (dto.getIsEnabled() != null) relation.setEnabled(dto.getIsEnabled());
        Relation saved = relationRepository.save(relation);
        return toVO(saved);
    }

    @Override
    public boolean deleteRelation(Long id) {
        if (!relationRepository.existsById(id)) {
            return false;
        }
        relationRepository.deleteById(id);
        return true;
    }

    @Override
    public RelationVO toggleRelation(Long id) {
        Relation relation = relationRepository.findById(id)
                .orElseThrow(() -> new BusinessException(404, "关系不存在"));
        Boolean current = relation.getEnabled();
        relation.setEnabled(current == null || !current);
        Relation saved = relationRepository.save(relation);
        return toVO(saved);
    }

    private RelationVO toVO(Relation relation) {
        RelationVO vo = new RelationVO();
        vo.setId(relation.getId());
        vo.setName(relation.getName());
        vo.setSourceModelId(relation.getSourceModelId());
        vo.setTargetModelId(relation.getTargetModelId());
        vo.setType(relation.getType());
        vo.setDescription(relation.getDescription());
        vo.setIsEnabled(relation.getEnabled());
        vo.setCreatedAt(relation.getCreatedAt());
        vo.setUpdatedAt(relation.getUpdatedAt());
        return vo;
    }
}
