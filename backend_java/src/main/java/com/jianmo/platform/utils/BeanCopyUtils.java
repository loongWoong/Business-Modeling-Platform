package com.jianmo.platform.utils;

import org.springframework.beans.BeanUtils;
import org.springframework.beans.FatalBeanException;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

public class BeanCopyUtils {
    private BeanCopyUtils() {
    }

    public static <T> T copyProperties(Object source, Class<T> targetClass) {
        if (source == null) {
            return null;
        }
        try {
            T target = targetClass.getDeclaredConstructor().newInstance();
            org.springframework.beans.BeanUtils.copyProperties(source, target);
            return target;
        } catch (Exception e) {
            throw new FatalBeanException("属性拷贝失败", e);
        }
    }

    public static void copyProperties(Object source, Object target) {
        if (source == null || target == null) {
            return;
        }
        org.springframework.beans.BeanUtils.copyProperties(source, target);
    }

    public static <T> List<T> copyList(List<?> sourceList, Class<T> targetClass) {
        if (sourceList == null || sourceList.isEmpty()) {
            return new ArrayList<>();
        }
        List<T> result = new ArrayList<>(sourceList.size());
        for (Object source : sourceList) {
            T target = copyProperties(source, targetClass);
            if (Objects.nonNull(target)) {
                result.add(target);
            }
        }
        return result;
    }
}
