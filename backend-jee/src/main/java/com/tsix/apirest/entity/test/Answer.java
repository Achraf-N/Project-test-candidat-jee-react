package com.tsix.apirest.entity.test;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class Answer {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private int id ;
    @ManyToOne
    @JoinColumn(name = "question_id")
    private Question question ;
    @Column(nullable = false)
    private String label ;
    @Column(nullable = false , name = "is_correct")
    private boolean correct ;


}
