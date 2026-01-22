package com.tsix.apirest.repository;

import com.tsix.apirest.entity.test.Answer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
@ApplicationScoped
public class AnswerRepo extends CrudRepo<Answer>{
    public AnswerRepo(){super();}
    public AnswerRepo(EntityManager entityManager){
        this.entityManager = entityManager;
    }
}
