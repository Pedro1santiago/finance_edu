package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.exception.NaoEncontradoException;
import br.edu.financeedu.domain.model.Conteudo;
import br.edu.financeedu.domain.model.Modulo;
import br.edu.financeedu.domain.port.out.ConteudoRepositoryPort;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ConteudoServiceTest {

    private final ConteudoRepositoryPort repo = mock(ConteudoRepositoryPort.class);
    private final ConteudoService service = new ConteudoService(repo);

    private final Modulo modulo = new Modulo(1L, "Orçamento", "d", 1);
    private final Conteudo c1 = new Conteudo(10L, 1L, "A", "corpo", 1);
    private final Conteudo c2 = new Conteudo(11L, 1L, "B", "corpo", 2);

    @Test
    void listaConteudosMarcandoOsConcluidosDoUsuario() {
        when(repo.buscarModulo(1L)).thenReturn(Optional.of(modulo));
        when(repo.concluidos(5L)).thenReturn(Set.of(10L));
        when(repo.listarConteudos(1L)).thenReturn(List.of(c1, c2));

        var lista = service.listarConteudos(5L, 1L);

        assertThat(lista).extracting(c -> c.conteudo().id(), c -> c.concluido()).containsExactly(
                org.assertj.core.groups.Tuple.tuple(10L, true), org.assertj.core.groups.Tuple.tuple(11L, false));
    }

    @Test
    void moduloInexistenteDa404() {
        when(repo.buscarModulo(9L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.listarConteudos(5L, 9L)).isInstanceOf(NaoEncontradoException.class);
    }

    @Test
    void concluirConteudoInexistenteDa404SemGravar() {
        when(repo.buscarConteudo(99L)).thenReturn(Optional.empty());
        assertThatThrownBy(() -> service.concluir(5L, 99L)).isInstanceOf(NaoEncontradoException.class);
        verify(repo, never()).marcarConcluido(any(), any());
    }

    @Test
    void concluirGravaParaOUsuario() {
        when(repo.buscarConteudo(10L)).thenReturn(Optional.of(c1));
        service.concluir(5L, 10L);
        verify(repo).marcarConcluido(5L, 10L);
    }

    @Test
    void buscarIndicaSeEstaConcluido() {
        when(repo.buscarConteudo(10L)).thenReturn(Optional.of(c1));
        when(repo.concluidos(5L)).thenReturn(Set.of(10L));
        assertThat(service.buscar(5L, 10L).concluido()).isTrue();
    }

    @Test
    void progressoCalculaPercentualPorModulo() {
        when(repo.concluidos(5L)).thenReturn(Set.of(10L));
        when(repo.listarConteudos()).thenReturn(List.of(c1, c2));
        when(repo.listarModulos()).thenReturn(List.of(modulo, new Modulo(2L, "Vazio", "d", 2)));

        var progresso = service.progresso(5L);

        assertThat(progresso.get(0).percentual()).isEqualByComparingTo("50.00");
        assertThat(progresso.get(0).total()).isEqualTo(2);
        assertThat(progresso.get(1).total()).isZero();
        assertThat(progresso.get(1).percentual()).isEqualByComparingTo("0");
    }
}
