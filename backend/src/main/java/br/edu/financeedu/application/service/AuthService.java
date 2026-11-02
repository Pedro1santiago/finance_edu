package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.exception.CredenciaisInvalidasException;
import br.edu.financeedu.domain.exception.NaoEncontradoException;
import br.edu.financeedu.domain.exception.RegraNegocioException;
import br.edu.financeedu.domain.model.Usuario;
import br.edu.financeedu.domain.port.in.AuthUseCase;
import br.edu.financeedu.domain.port.out.PasswordHasherPort;
import br.edu.financeedu.domain.port.out.TokenPort;
import br.edu.financeedu.domain.port.out.UsuarioRepositoryPort;

import java.time.Clock;
import java.time.Instant;

public class AuthService implements AuthUseCase {

    private final UsuarioRepositoryPort usuarios;
    private final PasswordHasherPort hasher;
    private final TokenPort tokens;
    private final Clock clock;

    public AuthService(UsuarioRepositoryPort usuarios, PasswordHasherPort hasher, TokenPort tokens, Clock clock) {
        this.usuarios = usuarios;
        this.hasher = hasher;
        this.tokens = tokens;
        this.clock = clock;
    }

    @Override
    public Sessao registrar(String nome, String email, String senha) {
        String emailNormalizado = Usuario.normalizarEmail(email);
        if (usuarios.buscarPorEmail(emailNormalizado).isPresent()) {
            throw new RegraNegocioException("Email já cadastrado");
        }
        Usuario usuario = usuarios.salvar(
                new Usuario(null, nome.trim(), emailNormalizado, hasher.hash(senha), Instant.now(clock)));
        return new Sessao(tokens.gerar(usuario), usuario);
    }

    @Override
    public Sessao autenticar(String email, String senha) {
        Usuario usuario = usuarios.buscarPorEmail(Usuario.normalizarEmail(email))
                .filter(u -> hasher.confere(senha, u.senhaHash()))
                .orElseThrow(CredenciaisInvalidasException::new);
        return new Sessao(tokens.gerar(usuario), usuario);
    }

    @Override
    public Usuario buscarPorId(Long id) {
        return usuarios.buscarPorId(id).orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));
    }
}
