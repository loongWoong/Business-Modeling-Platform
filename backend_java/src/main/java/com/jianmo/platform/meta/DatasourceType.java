package com.jianmo.platform.meta;

public enum DatasourceType {
    MYSQL("mysql", "com.mysql.cj.jdbc.Driver", "jdbc:mysql://"),
    POSTGRESQL("postgresql", "org.postgresql.Driver", "jdbc:postgresql://"),
    SQLSERVER("sqlserver", "com.microsoft.sqlserver.jdbc.SQLServerDriver", "jdbc:sqlserver://"),
    DUCKDB("duckdb", "org.duckdb.Driver", "jdbc:duckdb:");

    private final String value;
    private final String driverClassName;
    private final String urlPrefix;

    DatasourceType(String value, String driverClassName, String urlPrefix) {
        this.value = value;
        this.driverClassName = driverClassName;
        this.urlPrefix = urlPrefix;
    }

    public String getValue() {
        return value;
    }

    public String getDriverClassName() {
        return driverClassName;
    }

    public String getUrlPrefix() {
        return urlPrefix;
    }

    public static DatasourceType fromValue(String value) {
        for (DatasourceType type : values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown datasource type: " + value);
    }

    public static boolean isValid(String value) {
        for (DatasourceType type : values()) {
            if (type.value.equalsIgnoreCase(value)) {
                return true;
            }
        }
        return false;
    }
}
