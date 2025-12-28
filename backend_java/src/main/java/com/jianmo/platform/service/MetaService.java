package com.jianmo.platform.service;

import com.jianmo.platform.dto.response.MetaModelVO;
import com.jianmo.platform.meta.MetaModel;

import java.util.List;

public interface MetaService {
    List<MetaModelVO> getAllMetaModels();
    MetaModelVO getMetaModel(String code);
    MetaModel getMetaModelEntity(String code);
    String exportMetaModelAsJson();
    void refreshMetaCache();
}
