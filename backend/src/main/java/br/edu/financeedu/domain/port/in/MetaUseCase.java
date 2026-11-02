package br.edu.financeedu.domain.port.in;

import br.edu.financeedu.domain.model.Aporte;
import br.edu.financeedu.domain.model.Meta;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public interface MetaUseCase {

    record DadosMeta(String nome, BigDecimal valorAlvo, LocalDate prazo) {
    }

    Meta criar(Long usuarioId, DadosMeta dados);

    List<Meta> listar(Long usuarioId);

    Meta buscar(Long usuarioId, Long metaId);

    Meta alterar(Long usuarioId, Long metaId, DadosMeta dados);

    void excluir(Long usuarioId, Long metaId);

    Aporte registrarAporte(Long usuarioId, Long metaId, BigDecimal valor, LocalDate data);
}
