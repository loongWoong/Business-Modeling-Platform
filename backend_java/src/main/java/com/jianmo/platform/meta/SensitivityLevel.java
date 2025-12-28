package com.jianmo.platform.meta;

public enum SensitivityLevel {
    PUBLIC("public"),
    INTERNAL("internal"),
    CONFIDENTIAL("confidential"),
    SECRET("secret");

    private final String value;

    SensitivityLevel(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SensitivityLevel fromValue(String value) {
        for (SensitivityLevel level : values()) {
            if (level.value.equals(value)) {
                return level;
            }
        }
        return PUBLIC;
    }
}
