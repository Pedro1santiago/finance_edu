package br.edu.financeedu.domain.port.out;

import br.edu.financeedu.domain.model.Usuario;

import java.util.Optional;

public interface UsuarioRepositoryPort {
    Usuario salvar(Usuario usuario);

    Optional<Usuario> buscarPorEmail(String email);

    Optional<Usuario> buscarPorId(Long id);
}
