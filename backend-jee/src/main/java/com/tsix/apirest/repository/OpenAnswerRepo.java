package com.tsix.apirest.repository;

import com.tsix.apirest.entity.test.OpenAnswer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
@ApplicationScoped
public class OpenAnswerRepo extends CrudRepo<OpenAnswer>{
    public OpenAnswerRepo(){super();}
    public OpenAnswerRepo(EntityManager entityManager){
        this.entityManager = entityManager;
    }
}
