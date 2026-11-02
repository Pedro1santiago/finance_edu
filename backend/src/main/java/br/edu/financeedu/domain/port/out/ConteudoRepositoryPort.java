package br.edu.financeedu.domain.port.out;

import br.edu.financeedu.domain.model.Conteudo;
import br.edu.financeedu.domain.model.Modulo;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ConteudoRepositoryPort {
    List<Modulo> listarModulos();

    Optional<Modulo> buscarModulo(Long id);

    List<Conteudo> listarConteudos();

    List<Conteudo> listarConteudos(Long moduloId);

    Optional<Conteudo> buscarConteudo(Long id);

    Set<Long> concluidos(Long usuarioId);

    /** Idempotente: marcar de novo não duplica. */
    void marcarConcluido(Long usuarioId, Long conteudoId);
}
