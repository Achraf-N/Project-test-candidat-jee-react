package com.tsix.apirest.repository;

import com.tsix.apirest.entity.enterprise.Enterprise;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;

import java.util.Optional;


@ApplicationScoped
public class EnterpriseRepo extends CrudRepo<Enterprise>{

    public EnterpriseRepo(EntityManager entityManager) {
        super(entityManager);
        this.entityManager = entityManager;
    }

    public EnterpriseRepo() {
        super();
    }

    public Optional<Enterprise> findByName(String name){
        return entityManager.createQuery("SELECT e FROM Enterprise e  WHERE e.name = :name", Enterprise.class)
                .setParameter("name" , name)
                .getResultList()
                .stream()
                .findFirst();
    }
}
