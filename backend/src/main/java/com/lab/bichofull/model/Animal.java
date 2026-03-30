package com.lab.bichofull.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.List;

@Entity
@Table(name = "animals")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Animal {
    @Id
    @Column(name = "group_number")
    private Integer groupNumber;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(name = "image_path", nullable = false)
    private String imagePath;

    @ElementCollection
    @CollectionTable(name = "animal_tens", joinColumns = @JoinColumn(name = "animal_group"))
    @Column(name = "ten")
    private List<String> tens;
}