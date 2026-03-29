package com.lab.bichofull.config;

import com.lab.bichofull.model.User;
import com.lab.bichofull.repository.UserRepository;
import com.lab.bichofull.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
@RequiredArgsConstructor
public class SecurityFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UserRepository userRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) 
            throws ServletException, IOException {
        
        var token = this.recoverToken(request);

        if (token != null) {
            var username = tokenService.getSubject(token);

            if (username != null) {
                // Busca o usuário no banco para garantir que ele ainda existe
                User user = userRepository.findByUsername(username).orElse(null);

                if (user != null) {
                    // Transforma a role do nosso Enum no formato que o Spring Security entende (ex: ROLE_PLAYER)
                    var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
                    
                    // Cria o objeto de autenticação
                    var authentication = new UsernamePasswordAuthenticationToken(user, null, Collections.singletonList(authority));
                    
                    // Salva a autenticação no contexto do Spring para a requisição atual
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            }
        }
        
        // Continua o fluxo da requisição (vai para o Controller)
        filterChain.doFilter(request, response);
    }

    // Método auxiliar para pegar o token do cabeçalho "Authorization"
    private String recoverToken(HttpServletRequest request) {
        var authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        return authHeader.replace("Bearer ", "");
    }
}