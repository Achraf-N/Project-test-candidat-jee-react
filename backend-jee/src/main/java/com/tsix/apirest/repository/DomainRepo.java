package com.tsix.apirest.repository;

import com.tsix.apirest.entity.enterprise.Domain;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
@ApplicationScoped
public class DomainRepo extends CrudRepo<Domain>{

    public DomainRepo(EntityManager entityManager) {
        super(entityManager);
    }

    public DomainRepo() {
        super();
    }
}
