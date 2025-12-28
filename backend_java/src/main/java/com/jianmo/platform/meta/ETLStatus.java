package com.jianmo.platform.meta;

public enum ETLStatus {
    INACTIVE("inactive"),
    ACTIVE("active"),
    RUNNING("running"),
    PAUSED("paused"),
    ERROR("error");

    private final String value;

    ETLStatus(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static ETLStatus fromValue(String value) {
        for (ETLStatus status : values()) {
            if (status.value.equals(value)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown ETL status: " + value);
    }
}
