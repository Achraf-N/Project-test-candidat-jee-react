package com.tsix.apirest;

import jakarta.ws.rs.ApplicationPath;
import jakarta.ws.rs.core.Application;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.info.Info;

@OpenAPIDefinition(
        info = @Info(
                title = "API REST",
                version = "1.0.0"
        )
)
@ApplicationPath("/")
public class HelloApplication extends Application {}