package com.tsix.apirest.mapper;

import com.tsix.apirest.dto.req.TestRequest;
import com.tsix.apirest.entity.test.Question;
import com.tsix.apirest.entity.test.Test;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class TestMapper {

    public Test toTest(TestRequest testRequest){
        return new Test(
                testRequest.getName(),
                testRequest.getId_enterprise(),
                testRequest.getId_admin() ,
                testRequest.getDuration_minute()
        ) ;
    }
}
