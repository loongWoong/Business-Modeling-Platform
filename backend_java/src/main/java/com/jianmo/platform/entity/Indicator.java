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
@Table(name = "indicators")
public class Indicator extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "domain_id")
    private Long domainId;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 计算表达式（如：SUM(amount) / COUNT(*)）
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String expression;

    /**
     * 返回类型（number, string, boolean, date等）
     */
    @Column(name = "return_type")
    private String returnType = "number";

    /**
     * 单位（如：元、个、次等）
     */
    private String unit;

    /**
     * 维度字段（JSON格式存储）
     */
    @Column(columnDefinition = "TEXT")
    private String dimensions;

    /**
     * 过滤条件（JSON格式存储）
     */
    @Column(columnDefinition = "TEXT")
    private String filters;

    /**
     * 排序字段（JSON格式存储）
     */
    @Column(name = "sort_fields", columnDefinition = "TEXT")
    private String sortFields;

    /**
     * 关联的属性ID列表（JSON格式存储）
     */
    @Column(name = "related_properties", columnDefinition = "TEXT")
    private String relatedProperties;

    /**
     * 状态（draft, active, deprecated）
     */
    private String status = "draft";

    /**
     * 创建者
     */
    private String creator;

    public Indicator(String code, String name, String expression, Long domainId) {
        this.code = code;
        this.name = name;
        this.expression = expression;
        this.domainId = domainId;
        this.returnType = "number";
        this.status = "draft";
    }
}
