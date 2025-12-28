package com.jianmo.platform.utils;

import java.util.UUID;

public class IdGenerator {
    private IdGenerator() {
    }

    public static Long generateId() {
        return System.currentTimeMillis();
    }

    public static String generateUUID() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public static String generateCode(String prefix) {
        return prefix + "_" + System.currentTimeMillis();
    }
}
