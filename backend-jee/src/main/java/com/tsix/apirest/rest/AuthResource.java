package com.tsix.apirest.rest;

import com.tsix.apirest.dto.req.CandidateAuthReq;
import com.tsix.apirest.dto.res.CandidateQuestionResponse;
import com.tsix.apirest.dto.res.LoginAndResponse;
import com.tsix.apirest.service.EnterpriseService;
import com.tsix.apirest.service.RenderQuestions;
import com.tsix.apirest.service.TestAuthService;
import jakarta.inject.Inject;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.util.List;
import java.util.Map;

@Path("/auth")
public class AuthResource {
    @Inject
    private EnterpriseService service ;
    @Inject
    private TestAuthService authService ;
    @Inject
    private RenderQuestions renderQuestions ;
    @POST
    @Produces("application/json")
    public Response login(LoginAndResponse request , @Context HttpServletResponse response){
            String token = service.authManager(request) ;
            Cookie cookie = new Cookie("test_token" , token) ;
            cookie.setPath("/");
            cookie.setMaxAge(24*60*60);
            response.addCookie(cookie);
            return Response
                    .ok()
                    .build() ;

    }

    @POST
    @Path("/candidate")
    @Produces("application/json")
    public Response loginCandidate(CandidateAuthReq request , @Context HttpServletResponse response){
        Map<String , Object> authManager= authService.authManager(request) ;
        String token = String.valueOf(authManager.get("token")) ;
        int idTest = (int) authManager.get("testId") ;
        Cookie cookie = new Cookie("test_token" , token) ;
        cookie.setPath("/");
        cookie.setMaxAge(24*60*60);
        response.addCookie(cookie);
        return Response
                .ok()
                .entity(renderQuestions.responseAfterAuth(idTest))
                .build() ;

    }

    @GET
    @Path("/test/{testId}/questions")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getQuestionsByTestId(@PathParam("testId") int testId) {
        List<CandidateQuestionResponse> questions = renderQuestions.getAllQuestionsByTestId(testId);
        return Response
                .ok()
                .entity(questions)
                .build();
    }

    @POST
    @Path("/logout")
    @Produces(MediaType.APPLICATION_JSON)
    public Response logout(@Context HttpServletResponse response) {
        // Create a cookie with the same name but set it to expire immediately
        Cookie cookie = new Cookie("test_token", null);
        cookie.setPath("/");
        cookie.setMaxAge(0); // Delete cookie by setting max age to 0
        cookie.setHttpOnly(true);
        response.addCookie(cookie);

        return Response
                .ok()
                .entity("{\"message\": \"Logged out successfully\"}")
                .build();
    }
}
