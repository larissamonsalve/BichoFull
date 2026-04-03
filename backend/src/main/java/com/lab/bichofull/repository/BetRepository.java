package com.lab.bichofull.repository;

import com.lab.bichofull.model.Bet;
import com.lab.bichofull.model.BetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

// Interface que gerencia as operações de banco de dados para a entidade Bet
@Repository
public interface BetRepository extends JpaRepository<Bet, Long> {
    
    // Busca a lista de apostas de um usuário específico, ordenadas pelas mais recentes
    List<Bet> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Busca as apostas de um usuário de forma paginada e ordenada por data
    Page<Bet> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Busca todas as apostas que possuem um status específico (ex: PENDING)
    List<Bet> findByStatus(BetStatus status);

    // Calcula o somatório total de prêmios ganhos por um usuário
    @Query("SELECT SUM(b.prizeWon) FROM Bet b WHERE b.user.id = :userId AND b.status = 'WINNER'")
    BigDecimal sumWinningsByUserId(Long userId);

    // Calcula o somatório total de valores perdidos em apostas de um usuário
    @Query("SELECT SUM(b.wagerAmount) FROM Bet b WHERE b.user.id = :userId AND b.status = 'LOSER'")
    BigDecimal sumLossesByUserId(Long userId);

    // Calcula o somatório de valores investidos em apostas que ainda aguardam sorteio
    @Query("SELECT SUM(b.wagerAmount) FROM Bet b WHERE b.user.id = :userId AND b.status = 'PENDING'")
    BigDecimal sumPendingAmountByUserId(Long userId);

    // Conta quantas apostas de um usuário possuem um determinado status
    long countByUserIdAndStatus(Long userId, BetStatus status);

    // Conta o número total de apostas realizadas por um usuário
    long countByUserId(Long userId);

    // Busca todas as apostas do sistema para fins administrativos, ordenadas por data
    List<Bet> findAllByOrderByCreatedAtDesc();
}