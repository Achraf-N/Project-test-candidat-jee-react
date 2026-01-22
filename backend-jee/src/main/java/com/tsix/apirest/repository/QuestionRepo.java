package com.tsix.apirest.repository;

import com.tsix.apirest.entity.test.Question;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

@ApplicationScoped
@NoArgsConstructor
public class QuestionRepo extends CrudRepo<Question>{

    public QuestionRepo(EntityManager entityManager){
        super(entityManager);
    }

    public List<Question> findByEnterpriseId(UUID enterpriseId){
        return entityManager.createQuery(
                        "SELECT DISTINCT q FROM Question q WHERE q.enterprise.id = :enterpriseId", Question.class)
                .setParameter("enterpriseId", enterpriseId)
                .getResultList();
    }
}
