package br.edu.financeedu.adapter.out.security;

import br.edu.financeedu.domain.port.out.PasswordHasherPort;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

@Component
class BCryptPasswordHasherAdapter implements PasswordHasherPort {

    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    @Override
    public String hash(String senha) {
        return encoder.encode(senha);
    }

    @Override
    public boolean confere(String senha, String hash) {
        return encoder.matches(senha, hash);
    }
}
