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
@Table(name = "data_lineage")
public class DataLineage extends BaseEntity {

    /**
     * 源模型ID
     */
    @Column(name = "source_model_id", nullable = false)
    private Long sourceModelId;

    /**
     * 目标模型ID
     */
    @Column(name = "target_model_id", nullable = false)
    private Long targetModelId;

    /**
     * 源属性编码
     */
    @Column(name = "source_property")
    private String sourceProperty;

    /**
     * 目标属性编码
     */
    @Column(name = "target_property")
    private String targetProperty;

    /**
     * 血缘类型：forward（正向）、reverse（反向）、endToEnd（端到端）、impact（影响分析）
     */
    @Column(name = "lineage_type")
    private String lineageType = "forward";

    /**
     * 转换规则/表达式
     */
    @Column(columnDefinition = "TEXT")
    private String transformation;

    /**
     * 数据源ID（如果涉及数据源）
     */
    @Column(name = "datasource_id")
    private Long datasourceId;

    /**
     * ETL任务ID（如果通过ETL产生）
     */
    @Column(name = "etl_task_id")
    private Long etlTaskId;

    /**
     * 血缘描述
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * 置信度（0-1，表示血缘关系的可信度）
     */
    @Column(name = "confidence_score")
    private Double confidenceScore = 1.0;

    /**
     * 是否自动发现（true：系统自动发现，false：手动配置）
     */
    @Column(name = "is_auto_discovered")
    private Boolean isAutoDiscovered = false;

    public DataLineage(Long sourceModelId, Long targetModelId, String lineageType) {
        this.sourceModelId = sourceModelId;
        this.targetModelId = targetModelId;
        this.lineageType = lineageType;
        this.confidenceScore = 1.0;
        this.isAutoDiscovered = false;
    }
}
