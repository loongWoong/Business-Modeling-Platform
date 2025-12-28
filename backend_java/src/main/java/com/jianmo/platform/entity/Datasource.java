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
@Table(name = "datasources")
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Datasource extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(nullable = false)
    private String url;

    @Column(name = "domain_id")
    private Long domainId;

    private String username;

    private String password;

    @Column(name = "table_name")
    private String tableName;

    private String status = "inactive";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "model_id")
    private Long modelId;

    @OneToMany(mappedBy = "datasource", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<Mapping> mappings = new ArrayList<>();

    @OneToMany(mappedBy = "datasource", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<ModelTableAssociation> modelTableAssociations = new ArrayList<>();

    public Datasource(String name, String type, String url, String username, String password) {
        this.name = name;
        this.type = type;
        this.url = url;
        this.username = username;
        this.password = password;
    }

    public void addMapping(Mapping mapping) {
        mappings.add(mapping);
        mapping.setDatasourceId(this.getId());
    }

    public void addModelTableAssociation(ModelTableAssociation association) {
        modelTableAssociations.add(association);
        association.setDatasourceId(this.getId());
    }

    public boolean toggleStatus() {
        this.status = "active".equals(this.status) ? "inactive" : "active";
        return "active".equals(this.status);
    }

    public boolean validateConnection() {
        if (url == null || url.isEmpty()) {
            return false;
        }
        String validTypes = "mysql,postgresql,sqlserver,duckdb";
        return validTypes.contains(type.toLowerCase());
    }
}
