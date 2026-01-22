package com.tsix.apirest.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.List;
import java.util.Optional;


public abstract class CrudRepo<T>{
    @PersistenceContext
    EntityManager entityManager ;

    public CrudRepo(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public CrudRepo() {}

    public T save(T entity){
        entityManager.persist(entity);
        return entity;
    }

    public List<T> saveAll(List<T> entities){
        entities.forEach(entityManager::persist);
        return entities;
    }

    public List<T> findAll(Class<T> clazz){
        return entityManager.createQuery("SELECT e FROM " + clazz.getSimpleName() + " e", clazz)
                .getResultList();
    }

    public Optional<T> findById(Class<T> clazz, Object id){
        return Optional
                .ofNullable(entityManager
                        .find(clazz, id));
    }

    public T update(T entity){
        return entityManager.merge(entity);
    }

    public void delete(T entity){
        entityManager.remove(entity);
    }
}
