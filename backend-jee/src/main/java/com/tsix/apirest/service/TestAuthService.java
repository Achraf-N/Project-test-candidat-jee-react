package com.tsix.apirest.service;

import com.tsix.apirest.dto.req.CandidateAuthReq;
import com.tsix.apirest.entity.TestSessionStatus;
import com.tsix.apirest.entity.test.Test;
import com.tsix.apirest.entity.test.TestSession;
import com.tsix.apirest.exceptions.userExceptions.InvalidCredentialException;
import com.tsix.apirest.repository.TestRepo;
import com.tsix.apirest.repository.TestSessionRepo;
import com.tsix.apirest.security.JwtUtils;
import jakarta.ejb.Stateless;
import jakarta.inject.Inject;

import java.util.Map;
import java.util.Optional;


@Stateless
public class TestAuthService {
    @Inject
    private TestRepo testRepo;
    @Inject
    private TestSessionRepo testSessionRepo;
    private static final String dummyPassword = "$2a$12$C6UzMDM.H6dfI/f/IKcEeOe4Gk6bZx1vKp2M9U1J0zQeC9Z9e" ;
    public Map<String , Object> authManager(CandidateAuthReq candidateAuthReq){
        Optional<TestSession> testSession = testSessionRepo.findByCodeSession(candidateAuthReq.accessCode()) ;
        String email = (testSession.isPresent())
                ? testSession.get().getEmailCandidate()
                : dummyPassword ;
        boolean availableSession = testSession.isPresent() && testSession.get().getIsUsed() ;
        boolean emailMatch = email.equals(candidateAuthReq.email()) ;
        if (testSession.isPresent() && emailMatch && !availableSession) {
            Long testSessionId = testSession.get().getId();
            testSessionRepo.updateTestSessionIsUsed(testSessionId , true);
            testSessionRepo.updateTestSessionStatus(testSessionId , TestSessionStatus.ACTIVE);
            int testId = testSession.get().getTest().getId();
            String token =  JwtUtils.generateToken(testSessionId , null);
            return Map.of("testId" , testId , "token" , token);
        }
        throw new InvalidCredentialException();
    }
}
