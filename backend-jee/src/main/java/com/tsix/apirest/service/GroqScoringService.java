package com.tsix.apirest.service;

import com.tsix.apirest.dto.req.OpenQuestionScoreRequest;
import com.tsix.apirest.dto.res.OpenQuestionScoreResponse;
import jakarta.ejb.Stateless;
import jakarta.json.Json;
import jakarta.json.JsonArray;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import jakarta.ws.rs.client.Client;
import jakarta.ws.rs.client.ClientBuilder;
import jakarta.ws.rs.client.Entity;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.io.StringReader;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Stateless
public class GroqScoringService {
    
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String GROQ_API_KEY = System.getenv("GROQ_API_KEY");
    
    public OpenQuestionScoreResponse scoreOpenQuestion(OpenQuestionScoreRequest request) {
        if (GROQ_API_KEY == null || GROQ_API_KEY.isEmpty()) {
            throw new RuntimeException("GROQ_API_KEY environment variable is not set");
        }
        
        Client client = ClientBuilder.newClient();
        
        try {
            String prompt = String.format(
                "You are an expert teacher evaluating a student's answer to an open-ended question.\n\n" +
                "Model Answer (Correct Answer):\n%s\n\n" +
                "Student's Answer:\n%s\n\n" +
                "Evaluate the student's answer based on:\n" +
                "1. Correctness: Does it match the key concepts in the model answer?\n" +
                "2. Completeness: Does it cover all important points?\n" +
                "3. Clarity: Is the explanation clear and well-structured?\n\n" +
                "Provide a score from 0 to %d and brief feedback.\n\n" +
                "Respond in this exact JSON format:\n" +
                "{\"score\": <number>, \"feedback\": \"<brief feedback>\"}",
                request.getModelAnswer(),
                request.getStudentAnswer(),
                request.getMaxPoints()
            );

            JsonObject message1 = Json.createObjectBuilder()
                    .add("role", "system")
                    .add("content", "You are an expert teacher. Always respond with valid JSON only.")
                    .build();
            
            JsonObject message2 = Json.createObjectBuilder()
                    .add("role", "user")
                    .add("content", prompt)
                    .build();
            
            JsonArray messages = Json.createArrayBuilder()
                    .add(message1)
                    .add(message2)
                    .build();
            
            JsonObject requestBody = Json.createObjectBuilder()
                    .add("model", "llama-3.3-70b-versatile")
                    .add("messages", messages)
                    .add("temperature", 0.3)
                    .add("max_tokens", 500)
                    .build();

            Response response = client
                    .target(GROQ_API_URL)
                    .request(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + GROQ_API_KEY)
                    .post(Entity.json(requestBody.toString()));
            
            if (response.getStatus() == 200) {
                String jsonResponse = response.readEntity(String.class);
                JsonReader jsonReader = Json.createReader(new StringReader(jsonResponse));
                JsonObject responseObj = jsonReader.readObject();
                
                // Extract content from Groq response
                String content = responseObj
                        .getJsonArray("choices")
                        .getJsonObject(0)
                        .getJsonObject("message")
                        .getString("content");

                JsonObject result = extractJsonFromContent(content);
                
                return new OpenQuestionScoreResponse(
                    request.getQuestionId(),
                    result.getInt("score", 0),
                    result.getString("feedback", ""),
                    request.getMaxPoints()
                );
                
            } else {
                String errorBody = response.readEntity(String.class);
                System.err.println("Groq API error: " + response.getStatus() + " - " + errorBody);
                return new OpenQuestionScoreResponse(
                    request.getQuestionId(),
                    0,
                    "Error scoring answer: " + response.getStatus(),
                    request.getMaxPoints()
                );
            }
            
        } catch (Exception e) {
            System.err.println("Error calling Groq API: " + e.getMessage());
            e.printStackTrace();
            return new OpenQuestionScoreResponse(
                request.getQuestionId(),
                0,
                "Error: " + e.getMessage(),
                request.getMaxPoints()
            );
        } finally {
            client.close();
        }
    }
    
    private JsonObject extractJsonFromContent(String content) {
        try {

            Pattern pattern = Pattern.compile("\\{[^}]+\\}");
            Matcher matcher = pattern.matcher(content);
            
            if (matcher.find()) {
                String jsonStr = matcher.group();
                JsonReader reader = Json.createReader(new StringReader(jsonStr));
                return reader.readObject();
            } else {
                // Try parsing the whole content
                JsonReader reader = Json.createReader(new StringReader(content));
                return reader.readObject();
            }
        } catch (Exception e) {
            System.err.println("Failed to parse JSON from content: " + content);
            return Json.createObjectBuilder()
                    .add("score", 0)
                    .add("feedback", "Failed to parse AI response")
                    .build();
        }
    }
}
