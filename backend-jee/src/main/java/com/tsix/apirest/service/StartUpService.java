package com.tsix.apirest.service;

import com.tsix.apirest.repository.TestSessionRepo;
import jakarta.annotation.PostConstruct;
import jakarta.ejb.Singleton;
import jakarta.ejb.Startup;
import jakarta.inject.Inject;

@Startup
@Singleton
public class StartUpService {
    @Inject
    private TestSessionRepo testSessionRepo;
    @PostConstruct
    public void init() {
        testSessionRepo.automaticUpdate();
    }
}
