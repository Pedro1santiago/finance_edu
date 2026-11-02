package br.edu.financeedu.config;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Map;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.config.YamlPropertiesFactoryBean;
import org.springframework.core.env.MapPropertySource;
import org.springframework.core.env.StandardEnvironment;
import org.springframework.core.io.ClassPathResource;

class ServerPortTest {

    private String portaResolvida(Map<String, Object> env) {
        var yaml = new YamlPropertiesFactoryBean();
        yaml.setResources(new ClassPathResource("application.yml"));
        var environment = new StandardEnvironment();
        environment.getPropertySources().addFirst(new MapPropertySource("teste", env));
        return environment.resolvePlaceholders(yaml.getObject().getProperty("server.port"));
    }

    @Test
    void escutaNaPortaDaVariavelPort() {
        assertThat(portaResolvida(Map.of("PORT", "10000"))).isEqualTo("10000");
    }

    @Test
    void usaOitoMilEOitentaPorPadrao() {
        assertThat(portaResolvida(Map.of())).isEqualTo("8080");
    }
}
