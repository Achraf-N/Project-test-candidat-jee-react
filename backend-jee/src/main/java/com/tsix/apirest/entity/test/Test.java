package com.tsix.apirest.entity.test;

import com.tsix.apirest.entity.enterprise.AdminAccount;
import com.tsix.apirest.entity.enterprise.Enterprise;
import com.tsix.apirest.utils.AccessCodeGenerator;
import jakarta.persistence.*;
import lombok.*;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter

public class Test {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private int id ;

    @ManyToOne
    @JoinColumn(name = "enterprise_id")
    private Enterprise enterprise ;

    @ManyToOne
    @JoinColumn(name = "admin_account_id")
    private AdminAccount adminAccount ;

    @Column(nullable = false)
    private String name ;

    @Column(nullable = false)
    private int durationMinute ;

    @Column(columnDefinition = "boolean default true")
    private Boolean isActive ;

    @Column(columnDefinition = "boolean default false")
    private Boolean isPublic ;

    @OneToMany(mappedBy = "test" , cascade = CascadeType.ALL , orphanRemoval = true)
    private Set<TestQuestions> testQuestions = new HashSet<>() ;

    public Test(String name, UUID enterprise, Long admin, int durationMinute) {
        this.name = name;
        this.enterprise = new Enterprise(enterprise) ;
        this.adminAccount = new AdminAccount(admin) ;
        this.durationMinute = durationMinute ;
        this.isActive = true ;
        this.isPublic = false ;
    }

    public Test(int testId) {
        this.id = testId ;
    }

    public void addQuestions(Question question , int position) {
        TestQuestions tq = new TestQuestions(this , question , position) ;
        this.testQuestions.add(tq) ;
    }

}
