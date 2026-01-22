package com.tsix.apirest.entity.test;

import com.tsix.apirest.entity.TestSessionStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "test_session")
@Setter
@Getter
public class TestSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "candidateemail", nullable = false)
    private String emailCandidate;
    
    @Column(name = "token", nullable = false)
    private String codeSession;
    
    @Column(name = "starttime", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();
    
    @Column(name = "tokenexpiresat")
    private LocalDateTime dateExpiration;
    
    @Column(name = "endtime")
    private LocalDateTime endTime;
    
    @Column(name = "tokenused", nullable = false)
    private Boolean isUsed = false;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private TestSessionStatus status = TestSessionStatus.PLANNED;
    
    @Column(name = "score")
    private double score;
    
    @ManyToOne
    @JoinColumn(name = "test_id")
    private Test test;


}
