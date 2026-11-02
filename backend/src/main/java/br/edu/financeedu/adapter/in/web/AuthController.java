package br.edu.financeedu.adapter.in.web;

import br.edu.financeedu.domain.model.Usuario;
import br.edu.financeedu.domain.port.in.AuthUseCase;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;

@RestController
@RequestMapping("/api")
class AuthController {

    record RegistroRequest(@NotBlank @Size(max = 120) String nome,
                           @NotBlank @Email @Size(max = 180) String email,
                           @NotBlank @Size(min = 8, max = 72) String senha) {
    }

    record LoginRequest(@NotBlank String email, @NotBlank String senha) {
    }

    record UsuarioResponse(Long id, String nome, String email, Instant criadoEm) {
        static UsuarioResponse de(Usuario u) {
            return new UsuarioResponse(u.id(), u.nome(), u.email(), u.criadoEm());
        }
    }

    record SessaoResponse(String token, UsuarioResponse usuario) {
        static SessaoResponse de(AuthUseCase.Sessao s) {
            return new SessaoResponse(s.token(), UsuarioResponse.de(s.usuario()));
        }
    }

    private final AuthUseCase auth;

    AuthController(AuthUseCase auth) {
        this.auth = auth;
    }

    @PostMapping("/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    SessaoResponse registrar(@Valid @RequestBody RegistroRequest r) {
        return SessaoResponse.de(auth.registrar(r.nome(), r.email(), r.senha()));
    }

    @PostMapping("/auth/login")
    SessaoResponse login(@Valid @RequestBody LoginRequest r) {
        return SessaoResponse.de(auth.autenticar(r.email(), r.senha()));
    }

    @GetMapping("/me")
    UsuarioResponse me(@AuthenticationPrincipal Jwt jwt) {
        return UsuarioResponse.de(auth.buscarPorId(UsuarioLogado.id(jwt)));
    }
}
