package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.exception.CredenciaisInvalidasException;
import br.edu.financeedu.domain.exception.NaoEncontradoException;
import br.edu.financeedu.domain.exception.RegraNegocioException;
import br.edu.financeedu.domain.model.Usuario;
import br.edu.financeedu.domain.port.in.AuthUseCase;
import br.edu.financeedu.domain.port.out.PasswordHasherPort;
import br.edu.financeedu.domain.port.out.TokenPort;
import br.edu.financeedu.domain.port.out.UsuarioRepositoryPort;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;

public class AuthService implements AuthUseCase {

    private static final int MAX_BYTES_SENHA = 72;

    private final UsuarioRepositoryPort usuarios;
    private final PasswordHasherPort hasher;
    private final TokenPort tokens;
    private final Clock clock;
    private final String hashDescartavel;

    public AuthService(UsuarioRepositoryPort usuarios, PasswordHasherPort hasher, TokenPort tokens, Clock clock) {
        this.usuarios = usuarios;
        this.hasher = hasher;
        this.tokens = tokens;
        this.clock = clock;
        this.hashDescartavel = hasher.hash("hash-descartavel");
    }

    @Override
    public Sessao registrar(String nome, String email, String senha) {
        int bytes = bytes(senha);
        if (bytes < 8 || bytes > MAX_BYTES_SENHA) {
            throw new RegraNegocioException("senha deve ter entre 8 e " + MAX_BYTES_SENHA + " bytes (UTF-8)");
        }
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
        if (bytes(senha) > MAX_BYTES_SENHA) throw new CredenciaisInvalidasException();
        Usuario usuario = usuarios.buscarPorEmail(Usuario.normalizarEmail(email)).orElse(null);
        // email inexistente gasta o mesmo tempo de um hash real, para não revelar quem tem conta
        boolean confere = hasher.confere(senha, usuario == null ? hashDescartavel : usuario.senhaHash());
        if (usuario == null || !confere) throw new CredenciaisInvalidasException();
        return new Sessao(tokens.gerar(usuario), usuario);
    }

    private static int bytes(String senha) {
        return senha.getBytes(StandardCharsets.UTF_8).length;
    }

    @Override
    public Usuario buscarPorId(Long id) {
        return usuarios.buscarPorId(id).orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));
    }
}
