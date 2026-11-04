package br.edu.financeedu.adapter.out.persistence;

import br.edu.financeedu.domain.exception.RegraNegocioException;
import br.edu.financeedu.domain.model.Usuario;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataIntegrityViolationException;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class CorridasPersistenceTest {

    @Test
    void emailDuplicadoNaGravacaoVira422() {
        var repo = mock(UsuarioPersistenceAdapter.Repo.class);
        when(repo.saveAndFlush(any())).thenThrow(new DataIntegrityViolationException("uk_usuarios_email"));
        var adapter = new UsuarioPersistenceAdapter(repo);

        assertThatThrownBy(() -> adapter.salvar(new Usuario(null, "Ana", "a@b.com", "hash", Instant.EPOCH)))
                .isInstanceOf(RegraNegocioException.class)
                .hasMessage("Email já cadastrado");
    }

    @Test
    void concluirNaoDependeDeLerAntesDeGravar() {
        var progresso = mock(ConteudoPersistenceAdapter.ProgressoRepo.class);
        Instant agora = Instant.parse("2026-03-15T12:00:00Z");
        var adapter = new ConteudoPersistenceAdapter(null, null, progresso, Clock.fixed(agora, ZoneOffset.UTC));

        assertThatCode(() -> adapter.marcarConcluido(1L, 2L)).doesNotThrowAnyException();
        verify(progresso).inserirSeAusente(1L, 2L, agora);
    }
}
