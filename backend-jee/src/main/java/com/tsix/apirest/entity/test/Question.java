package com.tsix.apirest.entity.test;

import com.tsix.apirest.entity.enterprise.Enterprise;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.Set;

@Entity
@AllArgsConstructor
@Getter
@Setter
@NoArgsConstructor
public class Question {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "question_seq")
    @SequenceGenerator(name = "question_seq", sequenceName = "question_seq", allocationSize = 50)
    private int id ;

    @Column(nullable = false)
    private String label ;

    private String hint ;

    @Enumerated(EnumType.STRING)
    @Column(name = "question_type", nullable = false)
    private QuestionType questionType;

    @Column(nullable = false)
    private double points ;

    @OneToMany(
        mappedBy = "question",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
            fetch = FetchType.EAGER
    )
    private Set<Answer> answers = new HashSet<>();

    @OneToOne(
            mappedBy = "question",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.EAGER
    )
    private OpenAnswer openAnswers ;

    @OneToMany(mappedBy = "question")
    private Set<TestQuestions> testQuestions ;

    @ManyToOne
    @JoinColumn(name = "enterprise_id")
    private Enterprise enterprise ;

}
