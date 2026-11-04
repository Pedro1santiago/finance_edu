package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.exception.NaoEncontradoException;
import br.edu.financeedu.domain.model.Aporte;
import br.edu.financeedu.domain.model.Meta;
import br.edu.financeedu.domain.port.in.MetaUseCase;
import br.edu.financeedu.domain.port.out.MetaRepositoryPort;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

public class MetaService implements MetaUseCase {

    private final MetaRepositoryPort metas;
    private final Clock clock;

    public MetaService(MetaRepositoryPort metas, Clock clock) {
        this.metas = metas;
        this.clock = clock;
    }

    @Override
    public Meta criar(Long usuarioId, DadosMeta d) {
        return metas.salvar(Meta.nova(usuarioId, d.nome(), d.valorAlvo(), d.prazo(), LocalDate.now(clock)));
    }

    @Override
    public List<Meta> listar(Long usuarioId) {
        return metas.listar(usuarioId);
    }

    @Override
    public Meta buscar(Long usuarioId, Long metaId) {
        // meta de outro usuário responde 404 para não revelar que existe
        return metas.buscar(metaId, usuarioId).orElseThrow(() -> new NaoEncontradoException("Meta não encontrada"));
    }

    @Override
    public Meta alterar(Long usuarioId, Long metaId, DadosMeta d) {
        Meta meta = buscar(usuarioId, metaId);
        meta.alterar(d.nome(), d.valorAlvo(), d.prazo(), LocalDate.now(clock));
        return metas.salvar(meta);
    }

    @Override
    public void excluir(Long usuarioId, Long metaId) {
        metas.excluir(buscar(usuarioId, metaId).id());
    }

    @Override
    public Aporte registrarAporte(Long usuarioId, Long metaId, BigDecimal valor, LocalDate data) {
        Meta meta = buscar(usuarioId, metaId);
        LocalDate hoje = LocalDate.now(clock);
        return metas.salvarAporte(meta.id(), meta.registrarAporte(valor, data == null ? hoje : data, hoje));
    }
}
