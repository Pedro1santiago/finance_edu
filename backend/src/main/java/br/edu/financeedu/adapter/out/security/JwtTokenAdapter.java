package br.edu.financeedu.adapter.out.security;

import br.edu.financeedu.domain.model.Usuario;
import br.edu.financeedu.domain.port.out.TokenPort;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

import java.time.Clock;
import java.time.Duration;
import java.time.Instant;

@Component
class JwtTokenAdapter implements TokenPort {

    private final JwtEncoder encoder;
    private final Clock clock;
    private final Duration expiracao;

    JwtTokenAdapter(JwtEncoder encoder, Clock clock, @Value("${app.jwt.expiracao-horas}") long horas) {
        this.encoder = encoder;
        this.clock = clock;
        this.expiracao = Duration.ofHours(horas);
    }

    @Override
    public String gerar(Usuario usuario) {
        Instant agora = Instant.now(clock);
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(usuario.id().toString())
                .claim("email", usuario.email())
                .issuedAt(agora)
                .expiresAt(agora.plus(expiracao))
                .build();
        return encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();
    }
}
