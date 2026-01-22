package com.tsix.apirest.entity.test;

import jakarta.persistence.*;
import lombok.*;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Table(name = "test_questions")
public class TestQuestions {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id ;

    @ManyToOne
    @JoinColumn(name = "question_id" , nullable = false)
    private Question question ;

    @ManyToOne
    @JoinColumn(name = "test_id" , nullable = false)
    private Test test ;
    
    private int position ;

    public TestQuestions(Test test, Question question, int position) {
        this.test = test;
        this.question = question;
        this.position = position;
    }
}
