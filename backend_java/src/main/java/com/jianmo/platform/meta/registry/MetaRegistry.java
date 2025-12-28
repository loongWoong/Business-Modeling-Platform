package com.jianmo.platform.meta.registry;

import com.jianmo.platform.meta.*;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class MetaRegistry {
    private final Map<String, MetaModel> models = new ConcurrentHashMap<>();
    private final Map<String, MetaProperty> properties = new ConcurrentHashMap<>();
    private final Map<String, MetaRelation> relations = new ConcurrentHashMap<>();

    public void register(MetaModel metaModel) {
        validateMetaModel(metaModel);
        models.put(metaModel.getCode(), metaModel);
        registerProperties(metaModel);
        registerRelations(metaModel);
    }

    private void validateMetaModel(MetaModel metaModel) {
        if (metaModel.getCode() == null || metaModel.getCode().isEmpty()) {
            throw new IllegalArgumentException("元模型编码不能为空");
        }
        if (models.containsKey(metaModel.getCode())) {
            throw new IllegalArgumentException("元模型编码已存在: " + metaModel.getCode());
        }
    }

    private void registerProperties(MetaModel metaModel) {
        String prefix = metaModel.getCode() + ".";
        for (MetaProperty prop : metaModel.getProperties()) {
            String key = prefix + prop.getCode();
            if (properties.containsKey(key)) {
                throw new IllegalArgumentException("属性编码已存在: " + key);
            }
            properties.put(key, prop);
        }
    }

    private void registerRelations(MetaModel metaModel) {
        for (MetaRelation rel : metaModel.getRelations()) {
            String key = metaModel.getCode() + "." + rel.getCode();
            if (relations.containsKey(key)) {
                throw new IllegalArgumentException("关系编码已存在: " + key);
            }
            relations.put(key, rel);
        }
    }

    public Optional<MetaModel> getModel(String code) {
        return Optional.ofNullable(models.get(code));
    }

    public List<MetaModel> getAllModels() {
        return new ArrayList<>(models.values());
    }

    public List<MetaProperty> getPropertiesForModel(String modelCode) {
        List<MetaProperty> result = new ArrayList<>();
        String prefix = modelCode + ".";
        for (Map.Entry<String, MetaProperty> entry : properties.entrySet()) {
            if (entry.getKey().startsWith(prefix)) {
                result.add(entry.getValue());
            }
        }
        return result;
    }

    public List<MetaRelation> getRelationsForModel(String modelCode) {
        List<MetaRelation> result = new ArrayList<>();
        for (MetaRelation rel : relations.values()) {
            if (rel.involvesModel(modelCode)) {
                result.add(rel);
            }
        }
        return result;
    }

    public Optional<MetaProperty> getProperty(String modelCode, String propertyCode) {
        return Optional.ofNullable(properties.get(modelCode + "." + propertyCode));
    }

    public void clear() {
        models.clear();
        properties.clear();
        relations.clear();
    }

    public int getModelCount() {
        return models.size();
    }

    public int getPropertyCount() {
        return properties.size();
    }
}
