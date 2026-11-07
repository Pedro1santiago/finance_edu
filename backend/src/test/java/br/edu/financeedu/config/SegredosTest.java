package br.edu.financeedu.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.context.PropertyPlaceholderAutoConfiguration;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.mock.env.MockEnvironment;

class SegredosTest {

    private MockEnvironment ambiente(String... perfis) {
        MockEnvironment env = new MockEnvironment();
        env.setActiveProfiles(perfis);
        ConfigDataEnvironmentPostProcessor.applyTo(env);
        return env;
    }

    @Test
    void contextoSemSegredoENemPerfilDevNaoInicia() {
        // MockEnvironment isola o teste de um JWT_SECRET definido no host
        new ApplicationContextRunner()
                .withInitializer(ctx -> ctx.setEnvironment(new MockEnvironment()))
                .withInitializer(new ConfigDataApplicationContextInitializer())
                .withConfiguration(AutoConfigurations.of(PropertyPlaceholderAutoConfiguration.class))
                .withUserConfiguration(SecurityConfig.class)
                .run(ctx -> {
                    assertThat(ctx).hasFailed();
                    assertThat(ctx.getStartupFailure()).hasStackTraceContaining("JWT_SECRET");
                });
    }

    @Test
    void semPerfilDevBancoEhObrigatorio() {
        MockEnvironment env = ambiente();
        for (String chave : new String[]{"spring.datasource.url", "spring.datasource.username", "spring.datasource.password"}) {
            org.assertj.core.api.Assertions.assertThatThrownBy(() -> env.getProperty(chave))
                    .hasMessageContaining("DB_");
        }
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
