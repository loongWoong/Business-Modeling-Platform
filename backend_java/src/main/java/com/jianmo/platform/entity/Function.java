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
@Table(name = "functions")
public class Function extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(name = "domain_id")
    private Long domainId;

    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 函数类型（aggregation, transformation, validation等）
     */
    @Column(name = "function_type")
    private String functionType;

    /**
     * 函数实现（SQL表达式、JavaScript代码等）
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String implementation;

    /**
     * 参数定义（JSON格式存储）
     */
    @Column(columnDefinition = "TEXT")
    private String parameters;

    /**
     * 返回类型
     */
    @Column(name = "return_type")
    private String returnType;

    /**
     * 使用示例（JSON格式存储）
     */
    @Column(name = "usage_examples", columnDefinition = "TEXT")
    private String usageExamples;

    /**
     * 状态（draft, active, deprecated）
     */
    private String status = "draft";

    /**
     * 创建者
     */
    private String creator;

    public Function(String code, String name, String implementation, Long domainId) {
        this.code = code;
        this.name = name;
        this.implementation = implementation;
        this.domainId = domainId;
        this.status = "draft";
    }
}
