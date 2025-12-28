package com.jianmo.platform.common.exception;

import lombok.Getter;

@Getter
public enum ErrorCode {
    SUCCESS(200, "success"),
    BAD_REQUEST(400, "请求参数错误"),
    UNAUTHORIZED(401, "未授权"),
    FORBIDDEN(403, "禁止访问"),
    NOT_FOUND(404, "资源不存在"),
    INTERNAL_ERROR(500, "系统内部错误"),
    VALIDATION_ERROR(400, "参数校验失败"),
    BUSINESS_ERROR(500, "业务处理失败"),

    MODEL_NOT_FOUND(404, "模型不存在"),
    MODEL_CODE_EXISTS(400, "模型编码已存在"),
    MODEL_CREATE_FAILED(500, "创建模型失败"),
    MODEL_UPDATE_FAILED(500, "更新模型失败"),
    MODEL_DELETE_FAILED(500, "删除模型失败"),

    PROPERTY_NOT_FOUND(404, "属性不存在"),
    PROPERTY_CREATE_FAILED(500, "创建属性失败"),

    RELATION_NOT_FOUND(404, "关系不存在"),
    RELATION_CREATE_FAILED(500, "创建关系失败"),

    DATASOURCE_NOT_FOUND(404, "数据源不存在"),
    DATASOURCE_CODE_EXISTS(400, "数据源名称已存在"),
    DATASOURCE_CONNECTION_FAILED(500, "数据源连接失败"),

    ETL_TASK_NOT_FOUND(404, "ETL任务不存在"),
    ETL_TASK_CREATE_FAILED(500, "创建ETL任务失败"),
    ETL_TASK_EXECUTE_FAILED(500, "执行ETL任务失败"),

    DOMAIN_NOT_FOUND(404, "领域不存在"),
    DOMAIN_CREATE_FAILED(500, "创建领域失败");

    private final Integer code;
    private final String message;

    ErrorCode(Integer code, String message) {
        this.code = code;
        this.message = message;
    }
}
