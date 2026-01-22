package com.tsix.apirest.entity.test;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class QuestionTypes {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private int id ;

    @Column(unique = true , nullable = false)
    private String type ;

    public QuestionTypes(int id) {
        this.id = id ;
    }

    private QuestionTypes(String type) {
        this.type = type ;
    }
}
