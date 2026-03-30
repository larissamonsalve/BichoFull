// main/java/com/lab/bichofull/dto/UserDTO.java
package com.lab.bichofull.dto;

import java.math.BigDecimal;

public record UserDTO(
    String name,
    String username,
    BigDecimal balance
) {}