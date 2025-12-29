package com.jianmo.platform.entity;

import com.jianmo.platform.common.BaseEntity;
import javax.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "shared_attributes")
public class SharedAttribute extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    @Column(name = "domain_id")
    private Long domainId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_required")
    private Boolean isRequired = false;

    @Column(name = "default_value")
    private String defaultValue;

    @Column(name = "min_length")
    private Integer minLength;

    @Column(name = "max_length")
    private Integer maxLength;

    private String pattern;

    @Column(name = "sensitivity_level")
    private String sensitivityLevel;

    @Column(name = "mask_rule")
    private String maskRule;

    /**
     * 使用此共享属性的模型ID列表（JSON格式存储）
     */
    @Column(name = "used_by_models", columnDefinition = "TEXT")
    private String usedByModels;

    public SharedAttribute(String code, String name, String type, Long domainId) {
        this.code = code;
        this.name = name;
        this.type = type;
        this.domainId = domainId;
    }
}
