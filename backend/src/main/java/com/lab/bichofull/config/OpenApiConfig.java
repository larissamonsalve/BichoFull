package com.lab.bichofull.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("BichoFull API")
                        .version("1.0")
                        .description("Documentação do sistema de simulador de Jogo do Bicho para fins acadêmicos."));
    }
}