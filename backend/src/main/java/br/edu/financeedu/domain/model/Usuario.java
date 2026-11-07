package br.edu.financeedu.domain.model;

import java.time.Instant;
import java.util.Locale;

public record Usuario(Long id, String nome, String email, String senhaHash, Instant criadoEm) {

    public static String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
