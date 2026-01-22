package com.tsix.apirest.dto.req;

import com.tsix.apirest.entity.test.Question;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class TestRequest{
    private String name ;
    private UUID id_enterprise ;
    private Long id_admin ;
    private int duration_minute ;
    private List<Question> questions ;
}
