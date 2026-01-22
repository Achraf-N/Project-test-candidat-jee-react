package com.tsix.apirest.repository;

import com.tsix.apirest.entity.test.KeyWords;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
@ApplicationScoped
public class KeyWordRepo extends CrudRepo<KeyWords> {
    public KeyWordRepo(){super();}
    public KeyWordRepo(EntityManager entityManager){
        this.entityManager = entityManager;
    }
}
