package br.edu.financeedu.config;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.context.config.ConfigDataEnvironmentPostProcessor;
import org.springframework.mock.env.MockEnvironment;

// Carrega o application.yml pelo config data do Boot; MockEnvironment nao le o ambiente do host.
class ServerPortTest {

    private Integer portaCom(MockEnvironment env) {
        ConfigDataEnvironmentPostProcessor.applyTo(env);
        return env.getProperty("server.port", Integer.class);
    }

    @Test
    void escutaNaPortaDaVariavelPort() {
        assertThat(portaCom(new MockEnvironment().withProperty("PORT", "10000"))).isEqualTo(10000);
    }

    @Test
    void usaOitoMilEOitentaPorPadrao() {
        assertThat(portaCom(new MockEnvironment())).isEqualTo(8080);
    }
}
