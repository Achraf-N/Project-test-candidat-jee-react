package com.tsix.apirest.repository;

import com.tsix.apirest.entity.test.Test;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@NoArgsConstructor
@ApplicationScoped
public class TestRepo extends CrudRepo<Test>{
    public TestRepo(EntityManager entityManager) {
        super(entityManager);
    }
    public List<Test> findByEnterpriseId(UUID enterpriseId){
        return entityManager.createQuery("SELECT t FROM Test t where t.enterprise.id = :enterpriseId" , Test.class)
                .setParameter("enterpriseId" , enterpriseId)
                .getResultList() ;
    }

    public Optional<Test> findByIdAndEnterpriseId(int testId, UUID enterpriseId) {
        List<Test> results = entityManager.createQuery(
                "SELECT t FROM Test t WHERE t.id = :testId AND t.enterprise.id = :enterpriseId",
                Test.class)
                .setParameter("testId", testId)
                .setParameter("enterpriseId", enterpriseId)
                .getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }
}
