package com.jianmo.platform.utils;

import java.util.regex.Pattern;

public class ValidateUtils {
    private static final Pattern CODE_PATTERN = Pattern.compile("^[a-zA-Z][a-zA-Z0-9_]*$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");
    private static final Pattern URL_PATTERN = Pattern.compile("^(https?://)?([\\w-]+\\.)+[\\w-]+(/[\\w-./?%&=]*)?$");

    private ValidateUtils() {
    }

    public static boolean isEmpty(String str) {
        return str == null || str.trim().isEmpty();
    }

    public static boolean isNotEmpty(String str) {
        return !isEmpty(str);
    }

    public static boolean isValidCode(String code) {
        if (isEmpty(code)) {
            return false;
        }
        return CODE_PATTERN.matcher(code).matches();
    }

    public static boolean isValidEmail(String email) {
        if (isEmpty(email)) {
            return false;
        }
        return EMAIL_PATTERN.matcher(email).matches();
    }

    public static boolean isValidUrl(String url) {
        if (isEmpty(url)) {
            return false;
        }
        return URL_PATTERN.matcher(url).matches();
    }

    public static boolean isInRange(Integer value, Integer min, Integer max) {
        if (value == null) {
            return false;
        }
        if (min != null && value < min) {
            return false;
        }
        if (max != null && value > max) {
            return false;
        }
        return true;
    }

    public static boolean isInRange(Long value, Long min, Long max) {
        if (value == null) {
            return false;
        }
        if (min != null && value < min) {
            return false;
        }
        if (max != null && value > max) {
            return false;
        }
        return true;
    }

    public static boolean isInLengthRange(String value, Integer minLength, Integer maxLength) {
        if (value == null) {
            return false;
        }
        int length = value.length();
        if (minLength != null && length < minLength) {
            return false;
        }
        if (maxLength != null && length > maxLength) {
            return false;
        }
        return true;
    }
}
