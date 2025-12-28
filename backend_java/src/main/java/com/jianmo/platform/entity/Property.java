package com.jianmo.platform.entity;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;


@Entity
@Table(name = "properties")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Property {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private String type;

    @Column(name = "model_id")
    private Long modelId;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_primary_key")
    private Boolean isPrimaryKey = false;

    @Column(name = "is_foreign_key")
    private Boolean isForeignKey = false;

    @Column(name = "default_value")
    private String defaultValue;

    @Column(columnDefinition = "TEXT")
    private String constraints;

    @Column(name = "sensitivity_level")
    private String sensitivityLevel;

    @Column(name = "mask_rule")
    private String maskRule;

    @Column(name = "physical_column")
    private String physicalColumn;

    @Column(name = "foreign_key_table")
    private String foreignKeyTable;

    @Column(name = "foreign_key_column")
    private String foreignKeyColumn;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "model_id", insertable = false, updatable = false)
    @ToString.Exclude
    private Model model;

    
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Property(String name, String code, String type, Long modelId) {
        this.name = name;
        this.code = code;
        this.type = type;
        this.modelId = modelId;
    }

    public boolean isValid() {
        if (code == null || code.isEmpty()) {
            return false;
        }
        return code.matches("^[a-zA-Z][a-zA-Z0-9_]*$");
    }
}
