package com.jianmo.platform.entity;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;


@Entity
@Table(name = "model_table_associations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ModelTableAssociation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "model_id")
    private Long modelId;

    @Column(name = "datasource_id")
    private Long datasourceId;

    @Column(name = "table_name")
    private String tableName;

    private String status = "active";

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", insertable = false, updatable = false)
    @ToString.Exclude
    private Model model;

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

    public ModelTableAssociation(Long modelId, Long datasourceId, String tableName) {
        this.modelId = modelId;
        this.datasourceId = datasourceId;
        this.tableName = tableName;
    }
}
