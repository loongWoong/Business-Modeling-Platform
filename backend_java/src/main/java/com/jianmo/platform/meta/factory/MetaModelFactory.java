package com.jianmo.platform.meta.factory;

import com.jianmo.platform.meta.*;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class MetaModelFactory {

    public MetaModel createModelMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("model");
        model.setName("业务模型");
        model.setDescription("业务领域的概念模型定义");
        model.setType(MetaType.AGGREGATE_ROOT);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "模型ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("name", "模型名称", "STRING", true, false, 1, 100, null));
        properties.add(createProperty("code", "模型编码", "STRING", true, true, 1, 50, "^[a-zA-Z][a-zA-Z0-9_]*$"));
        properties.add(createProperty("description", "模型描述", "STRING", false, false, 0, 500, null));
        properties.add(createProperty("creator", "创建者", "STRING", false, false, 0, 50, null));
        properties.add(createProperty("updatedAt", "更新时间", "DATETIME", false, false, null, null, null));
        properties.add(createProperty("domainId", "领域ID", "LONG", false, false, null, null, null));

        model.setProperties(properties);

        return model;
    }

    public MetaModel createPropertyMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("property");
        model.setName("模型属性");
        model.setDescription("模型的字段定义");
        model.setType(MetaType.ENTITY);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "属性ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("name", "属性名称", "STRING", true, false, 1, 100, null));
        properties.add(createProperty("code", "属性编码", "STRING", true, false, 1, 50, "^[a-zA-Z][a-zA-Z0-9_]*$"));
        properties.add(createProperty("type", "属性类型", "STRING", true, false, 1, 50, null));
        properties.add(createProperty("modelId", "模型ID", "LONG", true, false, null, null, null));
        properties.add(createProperty("isRequired", "是否必填", "BOOLEAN", false, false, null, null, null));
        properties.add(createProperty("description", "描述", "STRING", false, false, 0, 500, null));
        properties.add(createProperty("isPrimaryKey", "主键", "BOOLEAN", false, false, null, null, null));
        properties.add(createProperty("isForeignKey", "外键", "BOOLEAN", false, false, null, null, null));

        model.setProperties(properties);

        return model;
    }

    public MetaModel createDatasourceMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("datasource");
        model.setName("数据源");
        model.setDescription("数据源配置定义");
        model.setType(MetaType.AGGREGATE_ROOT);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "数据源ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("name", "数据源名称", "STRING", true, true, 1, 100, null));
        properties.add(createProperty("type", "数据源类型", "STRING", true, false, 1, 50, null));
        properties.add(createProperty("url", "连接URL", "STRING", true, false, 1, 500, null));
        properties.add(createProperty("username", "用户名", "STRING", false, false, 0, 100, null));
        properties.add(createProperty("password", "密码", "STRING", false, false, 0, 100, null));
        properties.add(createProperty("status", "状态", "STRING", false, false, null, null, null));

        model.setProperties(properties);

        return model;
    }

    public MetaModel createETLTaskMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("etl_task");
        model.setName("ETL任务");
        model.setDescription("数据抽取转换加载任务定义");
        model.setType(MetaType.AGGREGATE_ROOT);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "任务ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("name", "任务名称", "STRING", true, false, 1, 100, null));
        properties.add(createProperty("sourceDatasourceId", "源数据源ID", "LONG", true, false, null, null, null));
        properties.add(createProperty("targetModelId", "目标模型ID", "LONG", true, false, null, null, null));
        properties.add(createProperty("status", "状态", "STRING", false, false, null, null, null));
        properties.add(createProperty("schedule", "调度表达式", "STRING", false, false, 0, 100, null));
        properties.add(createProperty("config", "配置", "TEXT", false, false, null, null, null));

        model.setProperties(properties);

        return model;
    }

    public MetaModel createDomainMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("domain");
        model.setName("领域");
        model.setDescription("领域分类定义（支持workspace和category两种类型）");
        model.setType(MetaType.ENTITY);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "领域ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("code", "领域编码", "STRING", true, true, 1, 50, "^[a-zA-Z][a-zA-Z0-9_]*$"));
        properties.add(createProperty("name", "领域名称", "STRING", true, true, 1, 100, null));
        properties.add(createProperty("description", "描述", "STRING", false, false, 0, 500, null));
        properties.add(createProperty("owner", "所有者", "STRING", false, false, 0, 100, null));
        properties.add(createProperty("domainType", "领域类型", "STRING", false, false, null, null, null));
        properties.add(createProperty("isActive", "是否激活", "BOOLEAN", false, false, null, null, null));
        properties.add(createProperty("modelQuota", "模型配额", "INTEGER", false, false, null, null, null));
        properties.add(createProperty("permissions", "权限配置", "TEXT", false, false, null, null, null));
        properties.add(createProperty("workspaceConfig", "工作空间配置", "TEXT", false, false, null, null, null));

        model.setProperties(properties);

        return model;
    }

    public MetaModel createMappingMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("mapping");
        model.setName("字段映射");
        model.setDescription("数据源字段到模型属性的映射");
        model.setType(MetaType.ENTITY);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "映射ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("datasourceId", "数据源ID", "LONG", true, false, null, null, null));
        properties.add(createProperty("modelId", "模型ID", "LONG", true, false, null, null, null));
        properties.add(createProperty("fieldId", "源字段", "STRING", true, false, 1, 100, null));
        properties.add(createProperty("propertyId", "目标属性", "LONG", true, false, null, null, null));

        model.setProperties(properties);

        return model;
    }

    public MetaModel createRelationMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("relation");
        model.setName("模型关系");
        model.setDescription("模型之间的关系定义");
        model.setType(MetaType.ENTITY);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "关系ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("name", "关系名称", "STRING", true, false, 1, 100, null));
        properties.add(createProperty("sourceModelId", "源模型ID", "LONG", true, false, null, null, null));
        properties.add(createProperty("targetModelId", "目标模型ID", "LONG", true, false, null, null, null));
        properties.add(createProperty("type", "关系类型", "STRING", false, false, null, null, null));
        properties.add(createProperty("description", "描述", "STRING", false, false, 0, 500, null));

        model.setProperties(properties);

        return model;
    }

    public MetaModel createSharedAttributeMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("shared_attribute");
        model.setName("共享属性");
        model.setDescription("语义层-可在多个模型中复用的属性定义");
        model.setType(MetaType.ENTITY);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "共享属性ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("code", "属性编码", "STRING", true, true, 1, 50, "^[a-zA-Z][a-zA-Z0-9_]*$"));
        properties.add(createProperty("name", "属性名称", "STRING", true, false, 1, 100, null));
        properties.add(createProperty("type", "属性类型", "STRING", true, false, 1, 50, null));
        properties.add(createProperty("domainId", "领域ID", "LONG", false, false, null, null, null));
        properties.add(createProperty("description", "描述", "STRING", false, false, 0, 500, null));
        properties.add(createProperty("isRequired", "是否必填", "BOOLEAN", false, false, null, null, null));
        properties.add(createProperty("sensitivityLevel", "敏感级别", "STRING", false, false, null, null, null));

        model.setProperties(properties);
        return model;
    }

    public MetaModel createIndicatorMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("indicator");
        model.setName("指标");
        model.setDescription("语义层-业务指标定义");
        model.setType(MetaType.ENTITY);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "指标ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("code", "指标编码", "STRING", true, true, 1, 50, "^[a-zA-Z][a-zA-Z0-9_]*$"));
        properties.add(createProperty("name", "指标名称", "STRING", true, false, 1, 100, null));
        properties.add(createProperty("expression", "计算表达式", "TEXT", true, false, null, null, null));
        properties.add(createProperty("domainId", "领域ID", "LONG", false, false, null, null, null));
        properties.add(createProperty("returnType", "返回类型", "STRING", false, false, null, null, null));
        properties.add(createProperty("status", "状态", "STRING", false, false, null, null, null));

        model.setProperties(properties);
        return model;
    }

    public MetaModel createFunctionMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("function");
        model.setName("函数");
        model.setDescription("语义层-可复用的计算函数定义");
        model.setType(MetaType.ENTITY);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "函数ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("code", "函数编码", "STRING", true, true, 1, 50, "^[a-zA-Z][a-zA-Z0-9_]*$"));
        properties.add(createProperty("name", "函数名称", "STRING", true, false, 1, 100, null));
        properties.add(createProperty("implementation", "函数实现", "TEXT", true, false, null, null, null));
        properties.add(createProperty("domainId", "领域ID", "LONG", false, false, null, null, null));
        properties.add(createProperty("functionType", "函数类型", "STRING", false, false, null, null, null));
        properties.add(createProperty("returnType", "返回类型", "STRING", false, false, null, null, null));
        properties.add(createProperty("status", "状态", "STRING", false, false, null, null, null));

        model.setProperties(properties);
        return model;
    }

    public MetaModel createDataLineageMetaModel() {
        MetaModel model = new MetaModel();
        model.setCode("data_lineage");
        model.setName("数据血缘");
        model.setDescription("数据血缘关系定义");
        model.setType(MetaType.ENTITY);

        List<MetaProperty> properties = new ArrayList<>();
        properties.add(createProperty("id", "血缘ID", "LONG", true, true, null, null, null));
        properties.add(createProperty("sourceModelId", "源模型ID", "LONG", true, false, null, null, null));
        properties.add(createProperty("targetModelId", "目标模型ID", "LONG", true, false, null, null, null));
        properties.add(createProperty("sourceProperty", "源属性", "STRING", false, false, null, null, null));
        properties.add(createProperty("targetProperty", "目标属性", "STRING", false, false, null, null, null));
        properties.add(createProperty("lineageType", "血缘类型", "STRING", false, false, null, null, null));
        properties.add(createProperty("transformation", "转换规则", "TEXT", false, false, null, null, null));
        properties.add(createProperty("confidenceScore", "置信度", "DOUBLE", false, false, null, null, null));

        model.setProperties(properties);
        return model;
    }

    public MetaProperty createProperty(String code, String name, String type,
                                       boolean required, boolean unique,
                                       Integer minLength, Integer maxLength,
                                       String pattern) {
        MetaProperty property = new MetaProperty();
        property.setCode(code);
        property.setName(name);
        property.setType(type);
        property.setRequired(required);
        property.setUnique(unique);
        property.setMinLength(minLength);
        property.setMaxLength(maxLength);
        property.setPattern(pattern);
        return property;
    }
}
