package br.edu.financeedu.config;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.mock.env.MockEnvironment;

class SegredosTest {

    private MockEnvironment ambiente(String... perfis) {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles(perfis);
        ConfigDataEnvironmentPostProcessor.applyTo(env);
        return env;
    }

    @Test
    void semPerfilDevSegredoEBancoSaoObrigatorios() {
        MockEnvironment env = ambiente();
        assertThatThrownBy(() -> env.getProperty("app.jwt.secret")).hasMessageContaining("JWT_SECRET");
        assertThatThrownBy(() -> env.getProperty("spring.datasource.url")).hasMessageContaining("DB_URL");
        assertThatThrownBy(() -> env.getProperty("spring.datasource.username")).hasMessageContaining("DB_USER");
        assertThatThrownBy(() -> env.getProperty("spring.datasource.password")).hasMessageContaining("DB_PASSWORD");
    }

    @Test
    void perfilDevTemPadroesLocais() {
        MockEnvironment env = ambiente("dev");
        assertThat(env.getProperty("app.jwt.secret")).hasSizeGreaterThanOrEqualTo(32);
        assertThat(env.getProperty("spring.datasource.url")).contains("localhost:5433");
    }

    @Test
    void variavelDeAmbienteVenceEmProducao() {
        MockEnvironment env = new MockEnvironment().withProperty("JWT_SECRET", "x".repeat(40));
        ConfigDataEnvironmentPostProcessor.applyTo(env);
        assertThat(env.getProperty("app.jwt.secret")).isEqualTo("x".repeat(40));
    }
}
