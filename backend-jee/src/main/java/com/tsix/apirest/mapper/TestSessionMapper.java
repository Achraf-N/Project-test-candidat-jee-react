package com.tsix.apirest.mapper;

import com.tsix.apirest.dto.req.TestSessionReq;
import com.tsix.apirest.entity.test.Test;
import com.tsix.apirest.entity.test.TestSession;
import com.tsix.apirest.service.MailService;
import com.tsix.apirest.utils.AccessCodeGenerator;

import java.util.ArrayList;
import java.util.List;

public class TestSessionMapper {
    private static final String DEFAULT_EMAIL = "achraf.zibouhe@gmail.com";
    
    public static List<TestSession> toEntity(TestSessionReq req){
        List<TestSession> testSessions = new ArrayList<>() ;
        req.getEmailCandidate().forEach( c-> {
                TestSession t = new TestSession() ;
                t.setTest(new Test(req.getTestId()));
                // Use default email if null or empty
                String email = (c != null && !c.trim().isEmpty()) ? c.trim() : DEFAULT_EMAIL;
                t.setEmailCandidate(email);
                t.setCodeSession(AccessCodeGenerator.generateAccessCode());
                t.setDateExpiration(req.getDateExpiration());
                testSessions.add(t);
            }
        );
        return testSessions ;
    }
}
