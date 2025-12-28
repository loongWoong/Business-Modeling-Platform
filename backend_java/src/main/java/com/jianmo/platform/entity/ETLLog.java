package com.jianmo.platform.entity;

import javax.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.ToString;

import java.time.LocalDateTime;


@Entity
@Table(name = "etl_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ETLLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "task_id")
    private Long taskId;

    private String status;

    @Column(name = "start_time")
    private LocalDateTime startTime;

    @Column(name = "end_time")
    private LocalDateTime endTime;

    @Column(name = "records_processed")
    private Integer recordsProcessed = 0;

    @Column(name = "records_success")
    private Integer recordsSuccess = 0;

    @Column(name = "records_failed")
    private Integer recordsFailed = 0;

    @Column(name = "error_message", columnDefinition = "TEXT")
    private String errorMessage;

    @Column(columnDefinition = "TEXT")
    private String details;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id", insertable = false, updatable = false)
    @ToString.Exclude
    private ETLTask task;

    public ETLLog(Long taskId, String status) {
        this.taskId = taskId;
        this.status = status;
        this.startTime = LocalDateTime.now();
    }

    public void complete() {
        this.endTime = LocalDateTime.now();
    }

    public void incrementProcessed() {
        this.recordsProcessed++;
    }

    public void incrementSuccess() {
        this.recordsSuccess++;
    }

    public void incrementFailed() {
        this.recordsFailed++;
    }
}
