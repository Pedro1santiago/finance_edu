package br.edu.financeedu.config;

import br.edu.financeedu.application.service.AuthService;
import br.edu.financeedu.application.service.SimulacaoService;
import br.edu.financeedu.domain.port.in.AuthUseCase;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase;
import br.edu.financeedu.domain.port.out.PasswordHasherPort;
import br.edu.financeedu.domain.port.out.SimulacaoRepositoryPort;
import br.edu.financeedu.domain.port.out.TokenPort;
import br.edu.financeedu.domain.port.out.UsuarioRepositoryPort;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

import java.time.Clock;

// Services ficam livres de Spring; o wiring acontece aqui.
@Configuration
@EnableJpaRepositories(basePackages = "br.edu.financeedu.adapter.out.persistence", considerNestedRepositories = true)
public class BeanConfig {

    @Bean
    Clock clock() {
        return Clock.systemDefaultZone();
    }

    @Bean
    AuthUseCase authUseCase(UsuarioRepositoryPort usuarios, PasswordHasherPort hasher, TokenPort tokens, Clock clock) {
        return new AuthService(usuarios, hasher, tokens, clock);
    }

    @Bean
    SimulacaoUseCase simulacaoUseCase(SimulacaoRepositoryPort simulacoes, Clock clock) {
        return new SimulacaoService(simulacoes, clock);
    }
}
