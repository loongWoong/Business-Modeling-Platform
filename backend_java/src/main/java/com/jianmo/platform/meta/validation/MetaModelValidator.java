package com.jianmo.platform.meta.validation;

import com.jianmo.platform.meta.MetaModel;
import com.jianmo.platform.meta.MetaProperty;
import com.jianmo.platform.meta.registry.MetaRegistry;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
public class MetaModelValidator {

    private final MetaRegistry metaRegistry;

    public MetaModelValidator(MetaRegistry metaRegistry) {
        this.metaRegistry = metaRegistry;
    }

    public ValidationResult validateModelCreate(String name, String code) {
        List<String> errors = new ArrayList<>();

        if (name == null || name.trim().isEmpty()) {
            errors.add("模型名称不能为空");
        } else if (name.length() > 100) {
            errors.add("模型名称长度不能超过100");
        }

        if (code == null || code.trim().isEmpty()) {
            errors.add("模型编码不能为空");
        } else if (!code.matches("^[a-zA-Z][a-zA-Z0-9_]*$")) {
            errors.add("模型编码必须以字母开头，只能包含字母、数字和下划线");
        } else if (metaRegistry.getModel(code).isPresent()) {
            errors.add("模型编码已存在: " + code);
        }

        return ValidationResult.from(errors);
    }

    public ValidationResult validateModelUpdate(String name, String code) {
        List<String> errors = new ArrayList<>();

        if (name != null && name.length() > 100) {
            errors.add("模型名称长度不能超过100");
        }

        if (code != null && !code.matches("^[a-zA-Z][a-zA-Z0-9_]*$")) {
            errors.add("模型编码必须以字母开头，只能包含字母、数字和下划线");
        }

        return ValidationResult.from(errors);
    }

    public ValidationResult validatePropertyCreate(String name, String code, String type) {
        List<String> errors = new ArrayList<>();

        if (name == null || name.trim().isEmpty()) {
            errors.add("属性名称不能为空");
        }

        if (code == null || code.trim().isEmpty()) {
            errors.add("属性编码不能为空");
        } else if (!code.matches("^[a-zA-Z][a-zA-Z0-9_]*$")) {
            errors.add("属性编码必须以字母开头，只能包含字母、数字和下划线");
        }

        if (type == null || type.trim().isEmpty()) {
            errors.add("属性类型不能为空");
        } else if (!isValidPropertyType(type)) {
            errors.add("不支持的属性类型: " + type);
        }

        return ValidationResult.from(errors);
    }

    public ValidationResult validateRelationCreate(Long sourceModelId, Long targetModelId) {
        List<String> errors = new ArrayList<>();

        if (sourceModelId == null) {
            errors.add("源模型ID不能为空");
        }

        if (targetModelId == null) {
            errors.add("目标模型ID不能为空");
        }

        if (sourceModelId != null && targetModelId != null && sourceModelId.equals(targetModelId)) {
            errors.add("源模型和目标模型不能相同");
        }

        return ValidationResult.from(errors);
    }

    public ValidationResult validateDataAgainstMeta(String modelCode, java.util.Map<String, Object> data) {
        List<String> errors = new ArrayList<>();

        java.util.Optional<MetaModel> modelOpt = metaRegistry.getModel(modelCode);
        if (modelOpt.isPresent()) {
            MetaModel metaModel = modelOpt.get();
            for (MetaProperty prop : metaModel.getProperties()) {
                Object value = data.get(prop.getCode());
                if (prop.isRequired() && value == null) {
                    errors.add("必填字段[" + prop.getName() + "]不能为空");
                }
                if (value != null && !prop.validate(value)) {
                    errors.add("字段[" + prop.getName() + "]校验失败");
                }
            }
        } else {
            errors.add("未找到元模型: " + modelCode);
        }

        return ValidationResult.from(errors);
    }

    private boolean isValidPropertyType(String type) {
        Set<String> validTypes = new HashSet<>();
        validTypes.add("STRING");
        validTypes.add("INTEGER");
        validTypes.add("LONG");
        validTypes.add("DOUBLE");
        validTypes.add("BOOLEAN");
        validTypes.add("DATE");
        validTypes.add("DATETIME");
        validTypes.add("TEXT");
        validTypes.add("JSON");
        validTypes.add("ENUM");
        return validTypes.contains(type.toUpperCase());
    }
}
