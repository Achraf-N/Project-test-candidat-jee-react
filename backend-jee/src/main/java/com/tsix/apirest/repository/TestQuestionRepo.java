package com.tsix.apirest.repository;

import com.tsix.apirest.entity.test.TestQuestions;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;

import java.util.List;

@ApplicationScoped
public class TestQuestionRepo extends CrudRepo <TestQuestions>{
    public TestQuestionRepo(){super();}
    public TestQuestionRepo(EntityManager entityManager){
        this.entityManager = entityManager;
    }

    public List<TestQuestions> getByTestId(Long testId){
        return entityManager.createQuery("SELECT t FROM TestQuestions t where  t.test.id = :testId" , TestQuestions.class)
                .setParameter("testId" , testId)
                .getResultList() ;

    }

    public Long countByTestId(int testId){
        return entityManager.createQuery("SELECT COUNT(t) FROM TestQuestions t where  t.test.id = :testId", Long.class)
                .setParameter("testId", testId)
                .getSingleResult();
    }
}
