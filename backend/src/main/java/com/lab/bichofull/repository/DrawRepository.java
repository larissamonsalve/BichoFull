package com.lab.bichofull.repository;

import com.lab.bichofull.model.Draw;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DrawRepository extends JpaRepository<Draw, Long> {
    List<Draw> findAllByOrderByDrawDateDesc();
}