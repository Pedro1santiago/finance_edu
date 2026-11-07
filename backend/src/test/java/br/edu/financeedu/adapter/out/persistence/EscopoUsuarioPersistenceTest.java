package br.edu.financeedu.adapter.out.persistence;

import br.edu.financeedu.domain.exception.NaoEncontradoException;
import br.edu.financeedu.domain.model.Aporte;
import br.edu.financeedu.domain.model.Meta;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class EscopoUsuarioPersistenceTest {

    private final MetaPersistenceAdapter.Repo repo = mock(MetaPersistenceAdapter.Repo.class);
    private final MetaPersistenceAdapter.AporteRepo aportes = mock(MetaPersistenceAdapter.AporteRepo.class);
    private final MetaPersistenceAdapter adapter = new MetaPersistenceAdapter(repo, aportes);

    @Test
    void salvarMetaDeOutroUsuarioNaoEncontra() {
        when(repo.findByIdAndUsuarioId(7L, 2L)).thenReturn(Optional.empty());
        Meta meta = new Meta(7L, 2L, "x", BigDecimal.TEN, LocalDate.now(), LocalDate.now(), List.of());
        assertThatThrownBy(() -> adapter.salvar(meta)).isInstanceOf(NaoEncontradoException.class);
        verify(repo, never()).save(any());
    }

    @Test
    void aporteEmMetaDeOutroUsuarioNaoGrava() {
        when(repo.existsByIdAndUsuarioId(7L, 2L)).thenReturn(false);
        assertThatThrownBy(() -> adapter.salvarAporte(2L, 7L, new Aporte(null, BigDecimal.TEN, LocalDate.now())))
                .isInstanceOf(NaoEncontradoException.class);
        verify(aportes, never()).save(any());
    }

    @Test
    void excluirFiltraPeloUsuario() {
        adapter.excluir(2L, 7L);
        verify(repo).excluir(7L, 2L);
    }
}
