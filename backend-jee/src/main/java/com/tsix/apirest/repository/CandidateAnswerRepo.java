package com.tsix.apirest.repository;

import com.tsix.apirest.entity.test.CandidateAnswer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;

import java.util.List;

@ApplicationScoped
public class CandidateAnswerRepo extends CrudRepo<CandidateAnswer> {

    public CandidateAnswerRepo() {
        super();
    }

    public CandidateAnswerRepo(EntityManager entityManager) {
        this.entityManager = entityManager;
    }

    public List<CandidateAnswer> findByTestSessionId(Long testSessionId) {
        return entityManager.createQuery(
                "SELECT ca FROM CandidateAnswer ca WHERE ca.testSession.id = :testSessionId",
                CandidateAnswer.class)
                .setParameter("testSessionId", testSessionId)
                .getResultList();
    }

    public boolean existsByTestSessionAndQuestion(Long testSessionId, int questionId) {
        Long count = entityManager.createQuery(
                "SELECT COUNT(ca) FROM CandidateAnswer ca " +
                "WHERE ca.testSession.id = :testSessionId AND ca.question.id = :questionId",
                Long.class)
                .setParameter("testSessionId", testSessionId)
                .setParameter("questionId", questionId)
                .getSingleResult();
        return count > 0;
    }
}

