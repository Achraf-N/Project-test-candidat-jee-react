package com.tsix.apirest.repository;

import com.tsix.apirest.entity.TestSessionStatus;
import com.tsix.apirest.entity.test.TestSession;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import lombok.NoArgsConstructor;

import java.util.Optional;

@NoArgsConstructor
@ApplicationScoped
public class TestSessionRepo extends CrudRepo<TestSession>{
    public TestSessionRepo(EntityManager e){super(e);}

    public Optional<TestSession> findByCodeSession(String codeSession){
        return entityManager.createQuery("SELECT t FROM TestSession t WHERE t.codeSession = :codeSession", TestSession.class)
                .setParameter("codeSession" , codeSession)
                .getResultList()
                .stream()
                .findFirst();
    }

    public java.util.List<TestSession> findByTestId(int testId){
        return entityManager.createQuery("SELECT t FROM TestSession t WHERE t.test.id = :testId ORDER BY t.dateCreation DESC", TestSession.class)
                .setParameter("testId", testId)
                .getResultList();
    }

    public void updateTestSessionIsUsed(Long id , boolean status){
        entityManager.createQuery("UPDATE TestSession t SET t.isUsed = :status WHERE t.id = :id")
                .setParameter("status" , status)
                .setParameter("id" , id)
                .executeUpdate();
    }

    public void updateTestSessionScore(Long id , double score){
        entityManager.createQuery("UPDATE TestSession t SET t.score = :score WHERE t.id = :id")
                .setParameter("score" , score)
                .setParameter("id" , id)
                .executeUpdate();
    }

    public void updateTestSessionStatus(Long id , TestSessionStatus status){
        entityManager.createQuery("UPDATE TestSession t SET t.status = :status WHERE t.id = :id")
                .setParameter("status" , status)
                .setParameter("id" , id)
                .executeUpdate();
    }

    public void automaticUpdate(){
        entityManager.createQuery("UPDATE TestSession t " +
                "SET t.status = 'FINISHED' " +
                "WHERE (t.status = 'PLANNED' OR t.status = 'SCHEDULED' OR t.status = 'ACTIVE') " +
                "AND t.dateExpiration < CURRENT_TIMESTAMP")
                .executeUpdate();
        System.out.println("Automatic update started");
    }

    public void migrateOldStatusValues() {
        try {
            // Migrate IN_PROGRESS to ACTIVE
            int inProgressUpdated = entityManager.createNativeQuery(
                    "UPDATE test_session SET status = 'ACTIVE' WHERE status = 'IN_PROGRESS'")
                    .executeUpdate();

            // Migrate COMPLETED to FINISHED
            int completedUpdated = entityManager.createNativeQuery(
                    "UPDATE test_session SET status = 'FINISHED' WHERE status = 'COMPLETED'")
                    .executeUpdate();

            // Migrate PLANNING to PLANNED (if any)
            int planningUpdated = entityManager.createNativeQuery(
                    "UPDATE test_session SET status = 'PLANNED' WHERE status = 'PLANNING'")
                    .executeUpdate();

            if (inProgressUpdated > 0 || completedUpdated > 0 || planningUpdated > 0) {
                System.out.println("Status migration completed: " +
                        inProgressUpdated + " IN_PROGRESS→ACTIVE, " +
                        completedUpdated + " COMPLETED→FINISHED, " +
                        planningUpdated + " PLANNING→PLANNED");
            }
        } catch (Exception e) {
            System.err.println("Error during status migration: " + e.getMessage());
        }
    }
}
