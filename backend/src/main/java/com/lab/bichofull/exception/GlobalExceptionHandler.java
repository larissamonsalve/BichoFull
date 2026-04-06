package com.lab.bichofull.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice // Diz ao Spring: "Intercepte qualquer erro que vazar dos Controllers"
public class GlobalExceptionHandler {

    // 1. Tratamento para Regras de Negócio (ex: "Saldo insuficiente", "Email já existe")
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBusinessRules(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

    // 2. Tratamento para Validações do @Valid (ex: Prêmios que não têm 4 dígitos)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
    }

    // 3. Fallback genérico para erros técnicos não previstos (Substitui o try-catch de erro 500)
    @ExceptionHandler(Exception.class)
    public ResponseEntity<String> handleGenericException(Exception ex) {
        //ex.printStackTrace();
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Ocorreu um erro interno no servidor. Tente novamente mais tarde.");
    }
}