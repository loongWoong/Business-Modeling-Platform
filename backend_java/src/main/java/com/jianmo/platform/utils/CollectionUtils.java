package com.jianmo.platform.utils;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

public class CollectionUtils {
    private CollectionUtils() {
    }

    public static boolean isEmpty(Collection<?> collection) {
        return collection == null || collection.isEmpty();
    }

    public static boolean isEmpty(Map<?, ?> map) {
        return map == null || map.isEmpty();
    }

    public static boolean isNotEmpty(Collection<?> collection) {
        return !isEmpty(collection);
    }

    public static boolean isNotEmpty(Map<?, ?> map) {
        return !isEmpty(map);
    }

    public static <T, R> List<R> toList(Collection<T> collection, Function<T, R> mapper) {
        if (isEmpty(collection)) {
            return new ArrayList<>();
        }
        return collection.stream()
                .map(mapper)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public static <T, R> Set<R> toSet(Collection<T> collection, Function<T, R> mapper) {
        if (isEmpty(collection)) {
            return new HashSet<>();
        }
        return collection.stream()
                .map(mapper)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    public static <T, K> Map<K, T> toMap(Collection<T> collection, Function<T, K> keyMapper) {
        if (isEmpty(collection)) {
            return new HashMap<>();
        }
        return collection.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(keyMapper, Function.identity(), (v1, v2) -> v1));
    }

    public static <T, K, V> Map<K, V> toMap(Collection<T> collection, Function<T, K> keyMapper, Function<T, V> valueMapper) {
        if (isEmpty(collection)) {
            return new HashMap<>();
        }
        return collection.stream()
                .filter(Objects::nonNull)
                .collect(Collectors.toMap(keyMapper, valueMapper, (v1, v2) -> v1));
    }

    public static <T> T getFirst(List<T> list) {
        if (isEmpty(list)) {
            return null;
        }
        return list.get(0);
    }

    public static <T> T getFirstOrDefault(List<T> list, T defaultValue) {
        T first = getFirst(list);
        return first != null ? first : defaultValue;
    }
}
