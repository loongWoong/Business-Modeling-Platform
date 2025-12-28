package com.jianmo.platform.entity;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;


@Entity
@Table(name = "relations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Relation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(name = "source_model_id")
    private Long sourceModelId;

    @Column(name = "target_model_id")
    private Long targetModelId;

    private String type = "one-to-many";

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_enabled")
    private Boolean isEnabled = true;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "source_model_id", insertable = false, updatable = false)
    @ToString.Exclude
    private Model sourceModel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_model_id", insertable = false, updatable = false)
    @ToString.Exclude
    private Model targetModel;

    
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public Relation(String name, Long sourceModelId, Long targetModelId, String type) {
        this.name = name;
        this.sourceModelId = sourceModelId;
        this.targetModelId = targetModelId;
        this.type = type;
    }

    public boolean involvesModel(Long modelId) {
        return (sourceModelId != null && sourceModelId.equals(modelId)) ||
               (targetModelId != null && targetModelId.equals(modelId));
    }

    public boolean isValid() {
        return sourceModelId != null && targetModelId != null && !sourceModelId.equals(targetModelId);
    }

    public Boolean getEnabled() { return isEnabled; }
    public void setEnabled(Boolean enabled) { isEnabled = enabled; }
}
