package com.jianmo.platform.common.constant;

public class Constants {
    private Constants() {
    }

    public static final String DEFAULT_PAGE_NUM = "1";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final int MAX_PAGE_SIZE = 100;

    public static final String ACTIVE_STATUS = "active";
    public static final String INACTIVE_STATUS = "inactive";

    public static final String ONE_TO_ONE = "one-to-one";
    public static final String ONE_TO_MANY = "one-to-many";
    public static final String MANY_TO_ONE = "many-to-one";
    public static final String MANY_TO_MANY = "many-to-many";

    public static final String MYSQL = "mysql";
    public static final String POSTGRESQL = "postgresql";
    public static final String SQLSERVER = "sqlserver";
    public static final String DUCKDB = "duckdb";
}
