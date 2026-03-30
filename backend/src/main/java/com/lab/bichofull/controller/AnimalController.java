package com.lab.bichofull.controller;

import com.lab.bichofull.model.Animal;
import com.lab.bichofull.repository.AnimalRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Comparator;

@RestController
@RequestMapping("/api/animals")
@RequiredArgsConstructor
public class AnimalController {

    private final AnimalRepository animalRepository;

    @GetMapping
    public ResponseEntity<List<Animal>> getAllAnimals() {
        List<Animal> animals = animalRepository.findAll();
        // Garante que a lista chegue ordenada pelo número do grupo
        animals.sort(Comparator.comparing(Animal::getGroupNumber));
        return ResponseEntity.ok(animals);
    }
}