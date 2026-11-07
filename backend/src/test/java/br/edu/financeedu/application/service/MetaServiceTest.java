package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.exception.NaoEncontradoException;
import br.edu.financeedu.domain.exception.RegraNegocioException;
import br.edu.financeedu.domain.model.Aporte;
import br.edu.financeedu.domain.model.Meta;
import br.edu.financeedu.domain.port.in.MetaUseCase;
import br.edu.financeedu.domain.port.out.MetaRepositoryPort;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MetaServiceTest {

    private final Clock clock = Clock.fixed(Instant.parse("2026-03-15T12:00:00Z"), ZoneOffset.UTC);
    private final LocalDate hoje = LocalDate.now(clock);
    private final MetaRepositoryPort repo = mock(MetaRepositoryPort.class);
    private final MetaService service = new MetaService(repo, clock);

    private Meta metaExistente() {
        return new Meta(7L, 1L, "Reserva", new BigDecimal("1000"), hoje.plusMonths(6), hoje, List.of());
    }

    @Test
    void criaMetaDoUsuarioComDataDeHoje() {
        when(repo.salvar(any())).thenAnswer(i -> i.getArgument(0));
        Meta m = service.criar(1L, new MetaUseCase.DadosMeta(" Viagem ", new BigDecimal("500"), hoje.plusDays(30)));
        assertThat(m.usuarioId()).isEqualTo(1L);
        assertThat(m.nome()).isEqualTo("Viagem");
        assertThat(m.criadaEm()).isEqualTo(hoje);
    }

    @Test
    void criarComDadosInvalidosNaoGrava() {
        assertThatThrownBy(() -> service.criar(1L, new MetaUseCase.DadosMeta("x", BigDecimal.ZERO, hoje)))
                .isInstanceOf(RegraNegocioException.class);
        verify(repo, never()).salvar(any());
    }

    @Test
    void listaMetasDoUsuario() {
        when(repo.listar(1L)).thenReturn(List.of(metaExistente()));
        assertThat(service.listar(1L)).hasSize(1);
    }

    @Test
    void alteraMetaExistenteEGrava() {
        when(repo.buscar(7L, 1L)).thenReturn(Optional.of(metaExistente()));
        when(repo.salvar(any())).thenAnswer(i -> i.getArgument(0));
        Meta m = service.alterar(1L, 7L, new MetaUseCase.DadosMeta("Nova", new BigDecimal("2000"), hoje.plusMonths(8)));
        assertThat(m.nome()).isEqualTo("Nova");
        assertThat(m.valorAlvo()).isEqualByComparingTo("2000");
    }

    @Test
    void alterarMetaDeOutroUsuarioDa404() {
        when(repo.buscar(7L, 2L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.alterar(2L, 7L, new MetaUseCase.DadosMeta("x", BigDecimal.TEN, hoje)))
                .isInstanceOf(NaoEncontradoException.class);
        verify(repo, never()).salvar(any());
    }

    @Test
    void metaDeOutroUsuarioDa404() {
        when(repo.buscar(7L, 2L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.buscar(2L, 7L)).isInstanceOf(NaoEncontradoException.class);
        assertThatThrownBy(() -> service.excluir(2L, 7L)).isInstanceOf(NaoEncontradoException.class);
        verify(repo, never()).excluir(any(), any());
    }

    @Test
    void aporteSemDataUsaHoje() {
        when(repo.buscar(7L, 1L)).thenReturn(Optional.of(metaExistente()));
        when(repo.salvarAporte(eq(1L), eq(7L), any())).thenAnswer(i -> i.getArgument(2));
        Aporte a = service.registrarAporte(1L, 7L, new BigDecimal("50"), null);
        assertThat(a.data()).isEqualTo(hoje);
    }

    @Test
    void aporteInvalidoNaoGrava() {
        when(repo.buscar(7L, 1L)).thenReturn(Optional.of(metaExistente()));
        assertThatThrownBy(() -> service.registrarAporte(1L, 7L, new BigDecimal("-5"), hoje))
                .isInstanceOf(RegraNegocioException.class);
        verify(repo, never()).salvarAporte(any(), any(), any());
    }
}
