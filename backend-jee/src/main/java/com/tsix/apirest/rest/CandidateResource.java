package com.tsix.apirest.rest;

import com.tsix.apirest.dto.req.SubmitTestRequest;
import com.tsix.apirest.dto.res.SubmitTestResponse;
import com.tsix.apirest.security.Secured;
import com.tsix.apirest.security.TokenInfoExtractor;
import com.tsix.apirest.service.CandidateTestService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

@Path("/candidate")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CandidateResource {

    @Inject
    private CandidateTestService candidateTestService;

    @POST
    @Path("/submit-test")
    @Transactional
    @Secured
    public Response submitTest(@Context SecurityContext securityContext , SubmitTestRequest request) {
        Long id = TokenInfoExtractor.getIdFromToken(securityContext);
        request.setTestSessionId(id);
        try {
            SubmitTestResponse response = candidateTestService.submitTest(request);
            return Response
                    .ok()
                    .entity(response)
                    .build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        }
    }

    @GET
    @Path("/results")
    @Secured
    public Response getTestResults(@Context SecurityContext securityContext) {
        Long id = TokenInfoExtractor.getIdFromToken(securityContext);
        try {
            SubmitTestResponse response = candidateTestService.getTestResults(id);
            return Response
                    .ok()
                    .entity(response)
                    .build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        }
    }
}

