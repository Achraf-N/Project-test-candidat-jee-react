package com.tsix.apirest.rest;

import com.tsix.apirest.dto.req.OpenQuestionScoreRequest;
import com.tsix.apirest.dto.res.OpenQuestionScoreResponse;
import com.tsix.apirest.service.GroqScoringService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/scoring")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ScoringResource {
    
    @Inject
    private GroqScoringService groqScoringService;
    
    @POST
    @Path("/open-question")
    public Response scoreOpenQuestion(OpenQuestionScoreRequest request) {
        try {
            OpenQuestionScoreResponse result = groqScoringService.scoreOpenQuestion(request);
            return Response.ok(result).build();
        } catch (Exception e) {
            return Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"" + e.getMessage() + "\"}")
                    .build();
        }
    }
    
    @GET
    @Path("/health")
    public Response healthCheck() {
        String apiKey = System.getenv("GROQ_API_KEY");
        boolean isConfigured = apiKey != null && !apiKey.isEmpty();
        
        return Response.ok()
                .entity("{\"status\": \"" + (isConfigured ? "ready" : "not configured") + "\", " +
                        "\"groqApiKey\": \"" + (isConfigured ? "set" : "not set") + "\"}")
                .build();
    }
}
