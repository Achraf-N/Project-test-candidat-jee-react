package com.tsix.apirest.entity.enterprise;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class AdminAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private Long id ;

    @Column(unique = true , nullable = false)
    private String username ;

    @Column(nullable = false)
    private String password ;

    @ManyToOne
    @JoinColumn(name = "enterprise_id")
    private Enterprise enterprise ;

    public AdminAccount(Long id) {
        this.id = id ;
    }

    public AdminAccount(String username , String password , Enterprise enterprise){
        this.username = username ;
        this.password = password ;
        this.enterprise = enterprise ;

    }
}
