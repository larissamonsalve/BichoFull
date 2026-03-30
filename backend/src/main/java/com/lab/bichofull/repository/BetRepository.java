// main/java/com/lab/bichofull/repository/BetRepository.java
package com.lab.bichofull.repository;

import com.lab.bichofull.model.Bet;
import com.lab.bichofull.model.BetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BetRepository extends JpaRepository<Bet, Long> {
    
    List<Bet> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Soma os prêmios ganhos
    @Query("SELECT SUM(b.prizeWon) FROM Bet b WHERE b.user.id = :userId AND b.status = 'WINNER'")
    BigDecimal sumWinningsByUserId(Long userId);

    // Soma as apostas perdidas
    @Query("SELECT SUM(b.wagerAmount) FROM Bet b WHERE b.user.id = :userId AND b.status = 'LOSER'")
    BigDecimal sumLossesByUserId(Long userId);

    // Soma o dinheiro preso nas apostas aguardando sorteio
    @Query("SELECT SUM(b.wagerAmount) FROM Bet b WHERE b.user.id = :userId AND b.status = 'PENDING'")
    BigDecimal sumPendingAmountByUserId(Long userId);

    // Conta quantas apostas estão pendentes
    long countByUserIdAndStatus(Long userId, BetStatus status);
}