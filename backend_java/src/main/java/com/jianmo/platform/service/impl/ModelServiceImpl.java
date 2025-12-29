package com.jianmo.platform.service.impl;

import com.jianmo.platform.dto.request.ModelCreateDTO;
import com.jianmo.platform.dto.request.ModelUpdateDTO;
import com.jianmo.platform.dto.request.PropertyCreateDTO;
import com.jianmo.platform.dto.request.RelationCreateDTO;
import com.jianmo.platform.dto.response.GraphVO;
import com.jianmo.platform.dto.response.ModelDetailVO;
import com.jianmo.platform.dto.response.ModelVO;
import com.jianmo.platform.dto.response.PropertyVO;
import com.jianmo.platform.dto.response.RelationVO;
import com.jianmo.platform.entity.Model;
import com.jianmo.platform.entity.Property;
import com.jianmo.platform.entity.Relation;
import com.jianmo.platform.common.exception.BusinessException;
import com.jianmo.platform.repository.ModelRepository;
import com.jianmo.platform.repository.PropertyRepository;
import com.jianmo.platform.repository.RelationRepository;
import com.jianmo.platform.meta.validation.MetaModelValidator;
import com.jianmo.platform.meta.validation.ValidationResult;
import com.jianmo.platform.service.ModelService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ModelServiceImpl implements ModelService {

    private final ModelRepository modelRepository;
    private final PropertyRepository propertyRepository;
    private final RelationRepository relationRepository;
    private final MetaModelValidator validator;

    public ModelServiceImpl(ModelRepository modelRepository, PropertyRepository propertyRepository,
                           RelationRepository relationRepository, MetaModelValidator validator) {
        this.modelRepository = modelRepository;
        this.propertyRepository = propertyRepository;
        this.relationRepository = relationRepository;
        this.validator = validator;
    }

    @Override
    public GraphVO getAllModels(Long domainId) {
        List<Model> models = (domainId != null)
                ? modelRepository.findByDomainId(domainId)
                : modelRepository.findAll();

        List<ModelVO> modelVOs = models.stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());

        List<Relation> relations = relationRepository.findAll();
        List<GraphVO.GraphEdge> edges = relations.stream()
                .map(r -> new GraphVO.GraphEdge(r.getSourceModelId(), r.getTargetModelId()))
                .collect(Collectors.toList());

        return new GraphVO(modelVOs, edges);
    }

    @Override
    public ModelDetailVO getModelById(Long id) {
        Model model = modelRepository.findById(id)
                .orElseThrow(() -> new BusinessException("模型不存在: " + id));

        List<Property> properties = propertyRepository.findByModelId(id);
        List<Relation> relations = relationRepository.findBySourceModelIdOrTargetModelId(id, id);

        return convertToDetailVO(model, properties, relations);
    }

    @Override
    @Transactional
    public ModelVO createModel(ModelCreateDTO dto) {
        ValidationResult validationResult = validator.validateModelCreate(dto.getName(), dto.getCode());
        if (!validationResult.isValid()) {
            throw new BusinessException(validationResult.getErrorMessage());
        }

        if (modelRepository.existsByCode(dto.getCode())) {
            throw new BusinessException("模型编码已存在: " + dto.getCode());
        }

        Model model = new Model();
        model.setCode(dto.getCode());
        model.setName(dto.getName());
        model.setDescription(dto.getDescription());
        model.setCreator(dto.getCreator());
        model.setDomainId(dto.getDomainId());
        model.setCreatedAt(LocalDateTime.now());
        model.setUpdatedAt(LocalDateTime.now());

        modelRepository.save(model);

        return convertToVO(model);
    }

    @Override
    @Transactional
    public ModelVO updateModel(Long id, ModelUpdateDTO dto) {
        Model model = modelRepository.findById(id)
                .orElseThrow(() -> new BusinessException("模型不存在: " + id));

        if (dto.getName() != null) {
            model.setName(dto.getName());
        }
        if (dto.getDescription() != null) {
            model.setDescription(dto.getDescription());
        }
        model.setUpdatedAt(LocalDateTime.now());

        modelRepository.save(model);

        return convertToVO(model);
    }

    @Override
    @Transactional
    public boolean deleteModel(Long id) {
        if (!modelRepository.existsById(id)) {
            return false;
        }

        propertyRepository.deleteByModelId(id);
        relationRepository.deleteBySourceModelId(id);
        relationRepository.deleteByTargetModelId(id);
        modelRepository.deleteById(id);

        return true;
    }

    @Override
    @Transactional
    public PropertyVO addProperty(Long modelId, PropertyCreateDTO dto) {
        if (!modelRepository.existsById(modelId)) {
            throw new BusinessException("模型不存在: " + modelId);
        }

        ValidationResult validationResult = validator.validatePropertyCreate(dto.getName(), dto.getCode(), dto.getType());
        if (!validationResult.isValid()) {
            throw new BusinessException(validationResult.getErrorMessage());
        }

        if (propertyRepository.existsByModelIdAndCode(modelId, dto.getCode())) {
            throw new BusinessException("属性编码已存在: " + dto.getCode());
        }

        Property property = new Property();
        property.setName(dto.getName());
        property.setCode(dto.getCode());
        property.setType(dto.getType());
        property.setModelId(modelId);
        property.setIsRequired(dto.getIsRequired());
        property.setDescription(dto.getDescription());
        property.setIsPrimaryKey(dto.getIsPrimaryKey());
        property.setIsForeignKey(dto.getIsForeignKey());
        property.setDefaultValue(dto.getDefaultValue());
        property.setSensitivityLevel(dto.getSensitivityLevel());
        property.setMaskRule(dto.getMaskRule());
        property.setPhysicalColumn(dto.getPhysicalColumn());
        property.setForeignKeyTable(dto.getForeignKeyTable());
        property.setForeignKeyColumn(dto.getForeignKeyColumn());
        property.setCreatedAt(LocalDateTime.now());
        property.setUpdatedAt(LocalDateTime.now());

        propertyRepository.save(property);

        return convertToPropertyVO(property);
    }

    @Override
    @Transactional
    public boolean removeProperty(Long modelId, Long propertyId) {
        Property property = propertyRepository.findById(propertyId)
                .orElse(null);
        if (property == null || !property.getModelId().equals(modelId)) {
            return false;
        }

        propertyRepository.deleteById(propertyId);
        return true;
    }

    @Override
    @Transactional
    public RelationVO addRelation(RelationCreateDTO dto) {
        ValidationResult validationResult = validator.validateRelationCreate(dto.getSourceModelId(), dto.getTargetModelId());
        if (!validationResult.isValid()) {
            throw new BusinessException(validationResult.getErrorMessage());
        }

        if (!modelRepository.existsById(dto.getSourceModelId())) {
            throw new BusinessException("源模型不存在: " + dto.getSourceModelId());
        }
        if (!modelRepository.existsById(dto.getTargetModelId())) {
            throw new BusinessException("目标模型不存在: " + dto.getTargetModelId());
        }

        Relation relation = new Relation();
        relation.setName(dto.getName());
        relation.setSourceModelId(dto.getSourceModelId());
        relation.setTargetModelId(dto.getTargetModelId());
        relation.setType(dto.getType() != null ? dto.getType() : "one-to-many");
        relation.setDescription(dto.getDescription());
        relation.setIsEnabled(dto.getIsEnabled() != null ? dto.getIsEnabled() : true);
        relation.setCreatedAt(LocalDateTime.now());
        relation.setUpdatedAt(LocalDateTime.now());

        relationRepository.save(relation);

        return convertToRelationVO(relation);
    }

    @Override
    @Transactional
    public boolean removeRelation(Long relationId) {
        if (!relationRepository.existsById(relationId)) {
            return false;
        }
        relationRepository.deleteById(relationId);
        return true;
    }

    @Override
    public List<ModelVO> getModelsByDomainId(Long domainId) {
        return modelRepository.findByDomainId(domainId).stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    private ModelVO convertToVO(Model model) {
        ModelVO vo = new ModelVO();
        vo.setId(model.getId());
        vo.setCode(model.getCode());
        // 修复可能存在的乱码数据（GBK字节被错误解释为UTF-8）
        vo.setName(com.jianmo.platform.utils.EncodingFixer.smartFix(model.getName()));
        vo.setDescription(com.jianmo.platform.utils.EncodingFixer.smartFix(model.getDescription()));
        vo.setCreator(com.jianmo.platform.utils.EncodingFixer.smartFix(model.getCreator()));
        vo.setDomainId(model.getDomainId());
        vo.setUpdatedAt(model.getUpdatedAt() != null ? model.getUpdatedAt().toString() : null);
        return vo;
    }

    private ModelDetailVO convertToDetailVO(Model model, List<Property> properties, List<Relation> relations) {
        ModelDetailVO vo = new ModelDetailVO();
        vo.setModel(convertToVO(model));
        vo.setProperties(properties.stream()
                .map(this::convertToPropertyVO)
                .collect(Collectors.toList()));
        vo.setRelations(relations.stream()
                .map(this::convertToRelationVO)
                .collect(Collectors.toList()));
        return vo;
    }

    private PropertyVO convertToPropertyVO(Property property) {
        PropertyVO vo = new PropertyVO();
        vo.setId(property.getId());
        // 修复可能存在的乱码数据
        vo.setName(com.jianmo.platform.utils.EncodingFixer.smartFix(property.getName()));
        vo.setCode(property.getCode());
        vo.setType(property.getType());
        vo.setModelId(property.getModelId());
        vo.setIsRequired(property.getIsRequired());
        vo.setDescription(com.jianmo.platform.utils.EncodingFixer.smartFix(property.getDescription()));
        vo.setIsPrimaryKey(property.getIsPrimaryKey());
        vo.setIsForeignKey(property.getIsForeignKey());
        vo.setDefaultValue(com.jianmo.platform.utils.EncodingFixer.smartFix(property.getDefaultValue()));
        vo.setSensitivityLevel(property.getSensitivityLevel());
        vo.setMaskRule(com.jianmo.platform.utils.EncodingFixer.smartFix(property.getMaskRule()));
        vo.setPhysicalColumn(com.jianmo.platform.utils.EncodingFixer.smartFix(property.getPhysicalColumn()));
        vo.setForeignKeyTable(com.jianmo.platform.utils.EncodingFixer.smartFix(property.getForeignKeyTable()));
        vo.setForeignKeyColumn(com.jianmo.platform.utils.EncodingFixer.smartFix(property.getForeignKeyColumn()));
        return vo;
    }

    private RelationVO convertToRelationVO(Relation relation) {
        RelationVO vo = new RelationVO();
        vo.setId(relation.getId());
        // 修复可能存在的乱码数据
        vo.setName(com.jianmo.platform.utils.EncodingFixer.smartFix(relation.getName()));
        vo.setSourceModelId(relation.getSourceModelId());
        vo.setTargetModelId(relation.getTargetModelId());
        vo.setType(relation.getType());
        vo.setDescription(com.jianmo.platform.utils.EncodingFixer.smartFix(relation.getDescription()));
        vo.setIsEnabled(relation.getIsEnabled());
        return vo;
    }
}
