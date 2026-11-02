package br.edu.financeedu.domain.port.in;

import br.edu.financeedu.domain.model.Usuario;

public interface AuthUseCase {

    record Sessao(String token, Usuario usuario) {
    }

    Sessao registrar(String nome, String email, String senha);

    Sessao autenticar(String email, String senha);

    Usuario buscarPorId(Long id);
}
