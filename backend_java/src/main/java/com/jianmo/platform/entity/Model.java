package com.jianmo.platform.entity;

import com.jianmo.platform.common.BaseEntity;
import javax.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

import java.util.ArrayList;
import java.util.List;


@Entity
@Table(name = "models")
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Model extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String creator;

    @Column(name = "domain_id")
    private Long domainId;

    @OneToMany(mappedBy = "model", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Property> properties = new ArrayList<>();

    @OneToMany(mappedBy = "sourceModel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Relation> outgoingRelations = new ArrayList<>();

    @OneToMany(mappedBy = "targetModel", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Relation> incomingRelations = new ArrayList<>();

    public Model(String code, String name, String description, String creator, Long domainId) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.creator = creator;
        this.domainId = domainId;
    }

    public void addProperty(Property property) {
        properties.add(property);
        property.setModelId(this.getId());
    }

    public void removeProperty(Property property) {
        properties.remove(property);
        property.setModelId(null);
    }

    public void addRelation(Relation relation) {
        if (relation.getSourceModelId() != null && relation.getSourceModelId().equals(this.getId())) {
            outgoingRelations.add(relation);
        } else if (relation.getTargetModelId() != null && relation.getTargetModelId().equals(this.getId())) {
            incomingRelations.add(relation);
        }
    }

    public boolean validateCode() {
        if (code == null || code.isEmpty()) {
            return false;
        }
        return code.matches("^[a-zA-Z][a-zA-Z0-9_]*$");
    }
}
