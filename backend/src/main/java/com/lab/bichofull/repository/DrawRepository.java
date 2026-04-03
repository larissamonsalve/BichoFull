package com.lab.bichofull.repository;

import com.lab.bichofull.model.Draw;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

// Indica que esta interface é um componente de acesso a dados (Repositório) do Spring
@Repository
public interface DrawRepository extends JpaRepository<Draw, Long> {
    
    // Busca todos os sorteios realizados, ordenando-os da data mais recente para a mais antiga
    List<Draw> findAllByOrderByDrawDateDesc();
}