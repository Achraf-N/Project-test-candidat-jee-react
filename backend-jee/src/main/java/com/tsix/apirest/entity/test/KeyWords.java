package com.tsix.apirest.entity.test;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Data
public class KeyWords {
    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE)
    private int id ;
    @ManyToOne
    @JoinColumn(name = "open_answer_id")
    private OpenAnswer openAnswer ;
    @Column(nullable = false)
    private String keyword ;
}
