package com.jianmo.platform.meta;

public enum RelationType {
    ONE_TO_ONE("one-to-one"),
    ONE_TO_MANY("one-to-many"),
    MANY_TO_ONE("many-to-one"),
    MANY_TO_MANY("many-to-many");

    private final String value;

    RelationType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static RelationType fromValue(String value) {
        for (RelationType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown relation type: " + value);
    }
}
