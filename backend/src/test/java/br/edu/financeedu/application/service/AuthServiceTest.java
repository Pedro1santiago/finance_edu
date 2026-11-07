package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.exception.CredenciaisInvalidasException;
import br.edu.financeedu.domain.exception.RegraNegocioException;
import br.edu.financeedu.domain.model.Usuario;
import br.edu.financeedu.domain.port.out.PasswordHasherPort;
import br.edu.financeedu.domain.port.out.TokenPort;
import br.edu.financeedu.domain.port.out.UsuarioRepositoryPort;
import org.junit.jupiter.api.Test;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Locale;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AuthServiceTest {

    private final Clock clock = Clock.fixed(Instant.parse("2026-03-15T12:00:00Z"), ZoneOffset.UTC);
    private final UsuarioRepositoryPort usuarios = mock(UsuarioRepositoryPort.class);
    private final PasswordHasherPort hasher = mock(PasswordHasherPort.class);
    private final TokenPort tokens = mock(TokenPort.class);
    private final AuthService service = new AuthService(usuarios, hasher, tokens, clock);

    private static final String SENHA_73_BYTES = "é".repeat(36) + "a";

    @Test
    void registraComEmailNormalizadoESenhaComHash() {
        when(usuarios.buscarPorEmail("ana@x.com")).thenReturn(Optional.empty());
        when(hasher.hash("senha12345")).thenReturn("hash");
        when(usuarios.salvar(any())).thenAnswer(i -> i.getArgument(0));
        when(tokens.gerar(any())).thenReturn("token");

        var sessao = service.registrar(" Ana ", " Ana@X.com ", "senha12345");

        assertThat(sessao.token()).isEqualTo("token");
        assertThat(sessao.usuario().nome()).isEqualTo("Ana");
        assertThat(sessao.usuario().email()).isEqualTo("ana@x.com");
        assertThat(sessao.usuario().senhaHash()).isEqualTo("hash");
    }

    @Test
    void emailJaCadastradoDa422() {
        when(usuarios.buscarPorEmail("ana@x.com")).thenReturn(Optional.of(new Usuario(1L, "Ana", "ana@x.com", "h", Instant.EPOCH)));
        assertThatThrownBy(() -> service.registrar("Ana", "ana@x.com", "senha12345"))
                .isInstanceOf(RegraNegocioException.class).hasMessage("Email já cadastrado");
        verify(usuarios, never()).salvar(any());
    }

    @Test
    void senhaPrecisaTerEntre8e72Bytes() {
        assertThatThrownBy(() -> service.registrar("Ana", "ana@x.com", SENHA_73_BYTES))
                .isInstanceOf(RegraNegocioException.class).hasMessageContaining("72 bytes");
        assertThatThrownBy(() -> service.registrar("Ana", "ana@x.com", "curta"))
                .isInstanceOf(RegraNegocioException.class);
        verify(hasher, never()).hash(SENHA_73_BYTES);
        verify(hasher, never()).hash("curta");
    }

    @Test
    void loginComSenhaAcimaDe72BytesEhCredencialInvalida() {
        when(usuarios.buscarPorEmail("ana@x.com")).thenReturn(Optional.of(new Usuario(1L, "Ana", "ana@x.com", "h", Instant.EPOCH)));
        when(hasher.confere(anyString(), anyString())).thenReturn(true);
        assertThatThrownBy(() -> service.autenticar("ana@x.com", SENHA_73_BYTES))
                .isInstanceOf(CredenciaisInvalidasException.class);
        verify(hasher, never()).confere(anyString(), anyString());
    }

    @Test
    void emailInexistenteTambemGastaOTempoDoHash() {
        when(usuarios.buscarPorEmail("naoexiste@x.com")).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.autenticar("naoexiste@x.com", "senha12345"))
                .isInstanceOf(CredenciaisInvalidasException.class);
        verify(hasher).confere(eq("senha12345"), any());
    }

    @Test
    void registroRejeitaCaracterDeControleNoNomeEEmail() {
        assertThatThrownBy(() -> service.registrar("An\u0000a", "ana@x.com", "senha12345"))
                .isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> service.registrar("Ana", "an\u0000a@x.com", "senha12345"))
                .isInstanceOf(RegraNegocioException.class);
        verify(usuarios, never()).salvar(any());
    }

    @Test
    void loginComCaracterDeControleNoEmailEhCredencialInvalida() {
        assertThatThrownBy(() -> service.autenticar("an\u0000a@x.com", "senha12345"))
                .isInstanceOf(CredenciaisInvalidasException.class);
        verify(usuarios, never()).buscarPorEmail(anyString());
    }

    @Test
    void senhaErradaDa401() {
        when(usuarios.buscarPorEmail("ana@x.com")).thenReturn(Optional.of(new Usuario(1L, "Ana", "ana@x.com", "h", Instant.EPOCH)));
        when(hasher.confere("errada123", "h")).thenReturn(false);
        assertThatThrownBy(() -> service.autenticar("ana@x.com", "errada123"))
                .isInstanceOf(CredenciaisInvalidasException.class);
        verify(tokens, never()).gerar(any());
    }

    @Test
    void loginCorretoGeraToken() {
        Usuario u = new Usuario(1L, "Ana", "ana@x.com", "h", Instant.EPOCH);
        when(usuarios.buscarPorEmail("ana@x.com")).thenReturn(Optional.of(u));
        when(hasher.confere("senha12345", "h")).thenReturn(true);
        when(tokens.gerar(u)).thenReturn("token");
        assertThat(service.autenticar("ANA@x.com", "senha12345").token()).isEqualTo("token");
    }

    @Test
    void normalizaEmailIndependenteDoLocaleDaMaquina() {
        Locale padrao = Locale.getDefault();
        Locale.setDefault(Locale.forLanguageTag("tr-TR"));
        try {
            assertThat(Usuario.normalizarEmail("INFO@X.COM")).isEqualTo("info@x.com");
        } finally {
            Locale.setDefault(padrao);
        }
    }
}
