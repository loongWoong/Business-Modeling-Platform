package com.jianmo.platform.entity;

import com.jianmo.platform.common.BaseEntity;
import javax.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "domains")
public class Domain extends BaseEntity {

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String owner;

    /**
     * Domain类型：workspace（工作空间）或 category（分类维度）
     * workspace: 类似Palantir的Workspace，支持权限隔离和资源管理
     * category: 简单的分类标签
     */
    @Column(name = "domain_type")
    private String domainType = "category";

    /**
     * 是否激活
     */
    @Column(name = "is_active")
    private Boolean isActive = true;

    /**
     * 资源配额限制（模型数量上限，null表示无限制）
     */
    @Column(name = "model_quota")
    private Integer modelQuota;

    /**
     * 权限配置（JSON格式存储）
     */
    @Column(name = "permissions", columnDefinition = "TEXT")
    private String permissions;

    /**
     * 工作空间配置（JSON格式存储）
     */
    @Column(name = "workspace_config", columnDefinition = "TEXT")
    private String workspaceConfig;

    public Domain(String code, String name, String description, String owner) {
        this.code = code;
        this.name = name;
        this.description = description;
        this.owner = owner;
        this.domainType = "category";
        this.isActive = true;
    }

    /**
     * 判断是否为工作空间类型
     */
    public boolean isWorkspace() {
        return "workspace".equalsIgnoreCase(this.domainType);
    }

    /**
     * 判断是否为分类维度类型
     */
    public boolean isCategory() {
        return "category".equalsIgnoreCase(this.domainType) || this.domainType == null;
    }
}
