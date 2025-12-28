package com.jianmo.platform.meta;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MetaModel {
    private String code;
    private String name;
    private String description;
    private String category;
    private MetaType type;
    private List<MetaProperty> properties = new ArrayList<>();
    private List<MetaRelation> relations = new ArrayList<>();
    private Map<String, Object> metadata;

    public boolean isValid() {
        if (code == null || code.isEmpty()) {
            return false;
        }
        return code.matches("^[a-zA-Z][a-zA-Z0-9_]*$");
    }

    public Optional<MetaProperty> getProperty(String code) {
        return properties.stream()
                .filter(p -> p.getCode().equals(code))
                .findFirst();
    }

    public boolean hasProperty(String code) {
        return properties.stream().anyMatch(p -> p.getCode().equals(code));
    }

    public void addProperty(MetaProperty property) {
        properties.add(property);
    }

    public void addRelation(MetaRelation relation) {
        relations.add(relation);
    }
}
