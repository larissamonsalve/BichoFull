// main/java/com/lab/bichofull/dto/BetDTO.java
package com.lab.bichofull.dto;

import com.lab.bichofull.model.BetMode;
import com.lab.bichofull.model.BetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record BetDTO(
    @NotNull BetType betType,
    @NotNull BetMode betMode,      
    @NotBlank String betValue,  
    @NotNull @Positive BigDecimal wagerAmount 
) {}