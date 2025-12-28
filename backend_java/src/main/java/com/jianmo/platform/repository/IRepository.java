package com.jianmo.platform.repository;

import java.util.List;
import java.util.Optional;

public interface IRepository<T, ID> {
    Optional<T> findById(ID id);
    List<T> findAll();
    List<T> findByIds(List<ID> ids);
    T save(T entity);
    T update(T entity);
    boolean deleteById(ID id);
    boolean existsById(ID id);
    long count();
}
