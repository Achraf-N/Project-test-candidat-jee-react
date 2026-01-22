package com.tsix.apirest.repository;

import com.tsix.apirest.entity.enterprise.AdminAccount;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;

import java.util.Optional;

@ApplicationScoped
public class AdminAccountRepo extends CrudRepo<AdminAccount>{
    AdminAccountRepo(EntityManager entityManager) {
        super(entityManager);
    }

    AdminAccountRepo() {
        super();
    }

    public Optional<AdminAccount> findByUsername(String username) {
        return entityManager
                .createQuery("SELECT a FROM AdminAccount a WHERE a.username = :username", AdminAccount.class)
                .setParameter("username", username)
                .getResultList()
                .stream()
                .findFirst();
    }
}
