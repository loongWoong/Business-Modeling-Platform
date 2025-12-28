package com.jianmo.platform.meta;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaProperty {
    private String code;
    private String name;
    private String type;
    private boolean required;
    private boolean unique;
    private String defaultValue;
    private String description;
    private Integer minLength;
    private Integer maxLength;
    private String pattern;
    private Map<String, String> constraints;
    private SensitivityLevel sensitivityLevel;
    private String maskRule;

    public boolean validate(Object value) {
        if (value == null) {
            return !required;
        }

        if (minLength != null && value.toString().length() < minLength) {
            return false;
        }
        if (maxLength != null && value.toString().length() > maxLength) {
            return false;
        }
        if (pattern != null && !value.toString().matches(pattern)) {
            return false;
        }
        return true;
    }

    public boolean isCompatibleWith(MetaProperty other) {
        return this.type.equals(other.getType());
    }

    public static MetaProperty createStringProperty(String code, String name, boolean required, int maxLength) {
        MetaProperty prop = new MetaProperty();
        prop.setCode(code);
        prop.setName(name);
        prop.setType("STRING");
        prop.setRequired(required);
        prop.setMaxLength(maxLength);
        return prop;
    }

    public static MetaProperty createLongProperty(String code, String name, boolean required) {
        MetaProperty prop = new MetaProperty();
        prop.setCode(code);
        prop.setName(name);
        prop.setType("LONG");
        prop.setRequired(required);
        return prop;
    }

    public static MetaProperty createBooleanProperty(String code, String name) {
        MetaProperty prop = new MetaProperty();
        prop.setCode(code);
        prop.setName(name);
        prop.setType("BOOLEAN");
        prop.setRequired(false);
        prop.setDefaultValue("false");
        return prop;
    }
}
