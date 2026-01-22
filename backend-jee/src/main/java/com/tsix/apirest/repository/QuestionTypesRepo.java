package com.tsix.apirest.repository;

import com.tsix.apirest.entity.test.QuestionTypes;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
@ApplicationScoped
public class QuestionTypesRepo extends CrudRepo<QuestionTypes>{
    public QuestionTypesRepo(){super();}
    public QuestionTypesRepo(EntityManager entityManager){
        this.entityManager = entityManager;
    }
}
