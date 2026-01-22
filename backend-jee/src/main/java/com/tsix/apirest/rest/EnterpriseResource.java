package com.tsix.apirest.rest;
import com.tsix.apirest.dto.res.LoginAndResponse;
import com.tsix.apirest.entity.enterprise.Domain;
import com.tsix.apirest.entity.enterprise.Enterprise;
import com.tsix.apirest.repository.DomainRepo;
import com.tsix.apirest.repository.EnterpriseRepo;
import com.tsix.apirest.security.Secured;
import com.tsix.apirest.security.TokenInfoExtractor;
import com.tsix.apirest.service.EnterpriseService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;

import java.util.List;
import java.util.UUID;

@Path("/enterprises")
@Produces("application/json")
public class EnterpriseResource {
    @Inject
    private EnterpriseRepo enterpriseRepo ;
    @Inject
    private EnterpriseService service ;
    @Inject
    private DomainRepo domainRepo ;


    @POST
    @Consumes("application/json")
    @Transactional
    public Response insertEnterprise(Enterprise enterprise){

        LoginAndResponse insertedEnterprise = service.insertEnterprise(enterprise) ;
        return Response.status(201)
                .entity(insertedEnterprise)
                .build() ;
    }

    @GET
    @Secured
    public Response getEnterpriseById(@Context SecurityContext securityContext){
        UUID id = TokenInfoExtractor.getEnterpriseIdFromToken(securityContext) ;
        return Response.ok(enterpriseRepo.findById((Enterprise.class) , id)).build() ;
    }

    @POST
    @Path("/domain")
    @Consumes("application/json")
    @Transactional
    public Response insertDomain(Domain domain){
        try{
            Domain insertedDomain = domainRepo.save(domain) ;
            return Response
                    .status(201)
                    .entity(insertedDomain)
                    .build() ;
        } catch (Exception e) {
            return Response
                    .status(500)
                    .entity("Error inserting domain: " + e).build() ;
        }
    }

    @POST
    @Path("/domains")
    @Consumes("application/json")
    public Response insertMultipleDomains(List<Domain> domains){
        try{
            List<Domain> insertedDomains = domainRepo.saveAll(domains) ;
            return Response
                    .status(201)
                    .entity(insertedDomains)
                    .build() ;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    @GET
    @Path("/domains")
    public Response getAllDomains(){
        try{
            List<Domain> domains = domainRepo.findAll(Domain.class) ;
            return Response.ok(domains).build() ;
        } catch (Exception e) {
            return Response
                    .status(500)
                    .entity("Error getting domains: " + e.getMessage()).build() ;
        }
    }
}
