package com.tsix.apirest.entity.enterprise;


import jakarta.persistence.*;

import java.util.UUID;

@Entity
public class Enterprise {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id ;
    @Column(unique = true , nullable = false)
    private String name ;

    @ManyToOne
    @JoinColumn(name = "domain_id")
    private Domain domain ;

    public Enterprise(UUID id, String name, Domain domain) {
        this.id = id;
        this.name = name;
        this.domain = domain;
    }

    public Enterprise(String name, Domain domain) {
        this.name = name;
        this.domain = domain;
    }

    public Enterprise(UUID id){
        this.id = id;
    }
    public Enterprise() {}

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Domain getDomain() {
        return domain;
    }

    public void setDomain(Domain domain) {
        this.domain = domain;
    }
}
