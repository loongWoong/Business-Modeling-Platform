package com.jianmo.platform.entity;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;


@Entity
@Table(name = "mappings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mapping {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "datasource_id")
    private Long datasourceId;

    @Column(name = "model_id")
    private Long modelId;

    @Column(name = "field_id")
    private String fieldId;

    @Column(name = "property_id")
    private Long propertyId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "datasource_id", insertable = false, updatable = false)
    @ToString.Exclude
    private Datasource datasource;

    
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Mapping(Long datasourceId, Long modelId, String fieldId, Long propertyId) {
        this.datasourceId = datasourceId;
        this.modelId = modelId;
        this.fieldId = fieldId;
        this.propertyId = propertyId;
    }

    public boolean isValid() {
        return fieldId != null && !fieldId.isEmpty() && propertyId != null;
    }
}
