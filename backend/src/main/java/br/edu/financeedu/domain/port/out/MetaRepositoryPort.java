package br.edu.financeedu.domain.port.out;

import br.edu.financeedu.domain.model.Aporte;
import br.edu.financeedu.domain.model.Meta;

import java.util.List;
import java.util.Optional;

public interface MetaRepositoryPort {
    /** Salva os dados da meta; aportes são gravados por {@link #salvarAporte}. */
    Meta salvar(Meta meta);

    Aporte salvarAporte(Long metaId, Aporte aporte);

    Optional<Meta> buscar(Long id, Long usuarioId);

    List<Meta> listar(Long usuarioId);

    void excluir(Long id);
}
