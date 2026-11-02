package br.edu.financeedu.adapter.in.web;

import org.springframework.security.oauth2.jwt.Jwt;

final class UsuarioLogado {

    private UsuarioLogado() {
    }

    static Long id(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
