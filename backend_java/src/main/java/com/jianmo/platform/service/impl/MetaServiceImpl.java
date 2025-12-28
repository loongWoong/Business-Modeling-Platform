package com.jianmo.platform.service.impl;

import com.jianmo.platform.dto.response.MetaModelVO;
import com.jianmo.platform.meta.MetaModel;
import com.jianmo.platform.meta.MetaProperty;
import com.jianmo.platform.meta.MetaRelation;
import com.jianmo.platform.meta.registry.MetaRegistry;
import com.jianmo.platform.service.MetaService;
import com.jianmo.platform.utils.JsonUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class MetaServiceImpl implements MetaService {

    private final MetaRegistry metaRegistry;

    public MetaServiceImpl(MetaRegistry metaRegistry) {
        this.metaRegistry = metaRegistry;
    }

    @Override
    public List<MetaModelVO> getAllMetaModels() {
        return metaRegistry.getAllModels().stream()
                .map(this::convertToVO)
                .collect(Collectors.toList());
    }

    @Override
    public MetaModelVO getMetaModel(String code) {
        return metaRegistry.getModel(code)
                .map(this::convertToVO)
                .orElse(null);
    }

    @Override
    public MetaModel getMetaModelEntity(String code) {
        return metaRegistry.getModel(code).orElse(null);
    }

    @Override
    public String exportMetaModelAsJson() {
        List<MetaModel> models = metaRegistry.getAllModels();
        return JsonUtils.toJson(models);
    }

    @Override
    public void refreshMetaCache() {
        metaRegistry.clear();
    }

    private MetaModelVO convertToVO(MetaModel model) {
        MetaModelVO vo = new MetaModelVO();
        vo.setCode(model.getCode());
        vo.setName(model.getName());
        vo.setDescription(model.getDescription());
        vo.setType(model.getType() != null ? model.getType().name() : null);

        List<MetaModelVO.MetaPropertyVO> propertyVOs = new ArrayList<>();
        for (MetaProperty prop : model.getProperties()) {
            MetaModelVO.MetaPropertyVO propVO = new MetaModelVO.MetaPropertyVO();
            propVO.setCode(prop.getCode());
            propVO.setName(prop.getName());
            propVO.setType(prop.getType());
            propVO.setRequired(prop.isRequired());
            propVO.setUnique(prop.isUnique());
            propVO.setMaxLength(prop.getMaxLength());
            propertyVOs.add(propVO);
        }
        vo.setProperties(propertyVOs);

        List<MetaModelVO.MetaRelationVO> relationVOs = new ArrayList<>();
        for (MetaRelation rel : model.getRelations()) {
            MetaModelVO.MetaRelationVO relVO = new MetaModelVO.MetaRelationVO();
            relVO.setCode(rel.getCode());
            relVO.setName(rel.getName());
            relVO.setSourceModelCode(rel.getSourceModelCode());
            relVO.setTargetModelCode(rel.getTargetModelCode());
            relVO.setType(rel.getType() != null ? rel.getType().name() : null);
            relationVOs.add(relVO);
        }
        vo.setRelations(relationVOs);

        return vo;
    }
}
