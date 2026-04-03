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

// Define que esta classe é um Controller REST para gerenciar requisições da API
@RestController
// Define o caminho base da URL para este controller (/api/animals)
@RequestMapping("/api/animals")
// Cria automaticamente um construtor com os campos obrigatórios (final), permitindo a injeção de dependência
@RequiredArgsConstructor
public class AnimalController {

    // Repositório para acessar os dados dos animais no banco de dados
    private final AnimalRepository animalRepository;

    // Define que este método responde a requisições HTTP GET na raiz do controller
    @GetMapping
    public ResponseEntity<List<Animal>> getAllAnimals() {
        // Busca todos os animais registrados no sistema
        List<Animal> animals = animalRepository.findAll();
        
        // Garante que a lista chegue ordenada pelo número do grupo (ex: 1 a 25)
        animals.sort(Comparator.comparing(Animal::getGroupNumber));
        
        // Retorna a lista ordenada com o status HTTP 200 OK
        return ResponseEntity.ok(animals);
    }
}