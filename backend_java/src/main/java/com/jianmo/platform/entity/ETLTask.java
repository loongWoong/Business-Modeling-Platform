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
@Table(name = "etl_tasks")
@EqualsAndHashCode(callSuper = true)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ETLTask extends BaseEntity {

    @Column(nullable = false)
    private String name;

    @Column(name = "source_datasource_id")
    private Long sourceDatasourceId;

    @Column(name = "target_model_id")
    private Long targetModelId;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "task_status")
    private String status = "inactive";

    @Column(columnDefinition = "TEXT")
    private String schedule;

    @Column(columnDefinition = "TEXT")
    private String config;

    @Column(name = "last_run")
    private String lastRun;

    @Column(name = "next_run")
    private String nextRun;

    @OneToMany(mappedBy = "task", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @ToString.Exclude
    private List<ETLLog> logs = new ArrayList<>();

    public ETLTask(String name, Long sourceDatasourceId, Long targetModelId) {
        this.name = name;
        this.sourceDatasourceId = sourceDatasourceId;
        this.targetModelId = targetModelId;
    }

    public void addLog(ETLLog log) {
        logs.add(log);
        log.setTaskId(this.getId());
    }

    public boolean activate() {
        if ("inactive".equals(status) || "paused".equals(status)) {
            this.status = "active";
            return true;
        }
        return false;
    }

    public boolean pause() {
        if ("active".equals(status)) {
            this.status = "paused";
            return true;
        }
        return false;
    }

    public boolean start() {
        if ("active".equals(status)) {
            this.status = "running";
            return true;
        }
        return false;
    }

    public boolean complete() {
        if ("running".equals(status)) {
            this.status = "active";
            this.lastRun = java.time.LocalDate.now().toString();
            return true;
        }
        return false;
    }

    public boolean markError() {
        if ("running".equals(status)) {
            this.status = "error";
            return true;
        }
        return false;
    }

    public boolean isValid() {
        return name != null && !name.isEmpty() &&
               sourceDatasourceId != null &&
               targetModelId != null;
    }
}
