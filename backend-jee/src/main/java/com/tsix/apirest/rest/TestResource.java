package com.tsix.apirest.rest;

import com.tsix.apirest.dto.req.TestRequest;
import com.tsix.apirest.dto.req.TestSessionReq;
import com.tsix.apirest.dto.res.QuestionResponse;
import com.tsix.apirest.dto.res.TestQuestionResponse;
import com.tsix.apirest.dto.res.TestResponse;
import com.tsix.apirest.entity.enterprise.Enterprise;
import com.tsix.apirest.entity.test.Question;
import com.tsix.apirest.repository.QuestionRepo;
import com.tsix.apirest.security.Secured;
import com.tsix.apirest.security.TokenInfoExtractor;
import com.tsix.apirest.security.UserPrincipal;
import com.tsix.apirest.service.TestService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.List;
import java.util.UUID;

@Path("/test")
public class TestResource {
    @Inject
    private QuestionRepo questionRepo;
    @Inject
    private TestService service ;

    @POST
    @Consumes("application/json")
    @Transactional
    @Secured
    public Response insertTest(@Context SecurityContext securityContext , TestRequest testRequest){
        UserPrincipal userPrincipal = TokenInfoExtractor.getUserPrincipal(securityContext) ;
        testRequest.setId_admin(userPrincipal.getUserId());
        testRequest.setId_enterprise(userPrincipal.getEnterpriseId());
        String saved = service.insertTest(testRequest) ;
        return Response
                .status(201)
                .entity(saved)
                .build() ;

    }

    @POST
    @Path("/questions")
    @Consumes("application/json")
    @Transactional
    @Produces(MediaType.APPLICATION_JSON)
    @Secured
    public Response insertQuestions(@Context SecurityContext securityContext , Question question){
        UUID enterpriseId = TokenInfoExtractor.getEnterpriseIdFromToken(securityContext) ;
        Enterprise e = new Enterprise(enterpriseId) ;
        question.setEnterprise(e) ;
        question.setId(0);

        String saved = service.insertQuestionAnswer(question) ;
        return Response
                .status(201)
                .entity(saved)
                .build() ;
    }


    @GET
    @Path("/questions")
    @Secured
    @Produces(MediaType.APPLICATION_JSON)
    @Transactional
    public Response getQuestionsByEnterprise(@Context SecurityContext securityContext){
        UUID id = TokenInfoExtractor.getEnterpriseIdFromToken(securityContext) ;
        List<QuestionResponse> questions = service.allQuestionByEnterpriseId(id) ;
        return Response
                .ok()
                .entity(questions)
                .build() ;
    }

    @GET
    @Secured
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTestsByEnterprise(@Context SecurityContext securityContext){
        UUID enterpriseId = TokenInfoExtractor.getEnterpriseIdFromToken(securityContext);
        List<TestResponse> tests = service.getTestsByEnterpriseId(enterpriseId);
        return Response
                .ok()
                .entity(tests)
                .build();
    }

    @GET
    @Path("/{testId}/questions")
    @Secured
    @Produces(MediaType.APPLICATION_JSON)
    public Response getQuestionsByTestId(@PathParam("testId") int testId,
                                          @Context SecurityContext securityContext) {
        UUID enterpriseId = TokenInfoExtractor.getEnterpriseIdFromToken(securityContext);
        List<TestQuestionResponse> questions = service.getQuestionsByTestId(testId, enterpriseId);
        return Response
                .ok()
                .entity(questions)
                .build();
    }


    @POST
    @Path("/invitation")
    @Consumes("application/json")
    @Transactional
    @Secured
    public Response inviteCandidates(@Context SecurityContext securityContext , TestSessionReq req){
        UUID enterpriseId = TokenInfoExtractor.getEnterpriseIdFromToken(securityContext) ;
        String res = service.registerCandidate(req , enterpriseId) ;
        return Response
                .status(201)
                .entity(res)
                .build() ;
    }

    @GET
    @Path("/{testId}/sessions")
    @Secured
    @Produces(MediaType.APPLICATION_JSON)
    public Response getTestSessionsByTestId(@PathParam("testId") int testId,
                                            @Context SecurityContext securityContext) {
        UUID enterpriseId = TokenInfoExtractor.getEnterpriseIdFromToken(securityContext);
        List<com.tsix.apirest.dto.res.TestSessionResponse> sessions = service.getTestSessionsByTestId(testId, enterpriseId);
        return Response
                .ok()
                .entity(sessions)
                .build();
    }
}
