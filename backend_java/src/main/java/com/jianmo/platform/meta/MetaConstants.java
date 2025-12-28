package com.jianmo.platform.meta;

public class MetaConstants {
    private MetaConstants() {
    }

    public static final String CODE_PATTERN = "^[a-zA-Z][a-zA-Z0-9_]*$";
    public static final int MAX_NAME_LENGTH = 100;
    public static final int MAX_DESCRIPTION_LENGTH = 500;
    public static final int MAX_CODE_LENGTH = 50;

    public static final String MODEL_CODE = "model";
    public static final String PROPERTY_CODE = "property";
    public static final String RELATION_CODE = "relation";
    public static final String DATASOURCE_CODE = "datasource";
    public static final String ETL_TASK_CODE = "etl_task";
    public static final String DOMAIN_CODE = "domain";
    public static final String MAPPING_CODE = "mapping";
}
