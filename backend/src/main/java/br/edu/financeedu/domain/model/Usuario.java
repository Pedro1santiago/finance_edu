package br.edu.financeedu.domain.model;

import java.time.Instant;

public record Usuario(Long id, String nome, String email, String senhaHash, Instant criadoEm) {

    public static String normalizarEmail(String email) {
        return email.trim().toLowerCase();
    }
}
