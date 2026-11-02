package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.exception.NaoEncontradoException;
import br.edu.financeedu.domain.model.Conteudo;
import br.edu.financeedu.domain.model.Modulo;
import br.edu.financeedu.domain.model.ProgressoModulo;
import br.edu.financeedu.domain.port.in.ConteudoUseCase;
import br.edu.financeedu.domain.port.out.ConteudoRepositoryPort;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

public class ConteudoService implements ConteudoUseCase {

    private final ConteudoRepositoryPort conteudos;

    public ConteudoService(ConteudoRepositoryPort conteudos) {
        this.conteudos = conteudos;
    }

    @Override
    public List<Modulo> listarModulos() {
        return conteudos.listarModulos();
    }

    @Override
    public List<ConteudoDoUsuario> listarConteudos(Long usuarioId, Long moduloId) {
        conteudos.buscarModulo(moduloId).orElseThrow(() -> new NaoEncontradoException("Módulo não encontrado"));
        Set<Long> concluidos = conteudos.concluidos(usuarioId);
        return conteudos.listarConteudos(moduloId).stream()
                .map(c -> new ConteudoDoUsuario(c, concluidos.contains(c.id())))
                .toList();
    }

    @Override
    public ConteudoDoUsuario buscar(Long usuarioId, Long conteudoId) {
        Conteudo c = existente(conteudoId);
        return new ConteudoDoUsuario(c, conteudos.concluidos(usuarioId).contains(c.id()));
    }

    @Override
    public void concluir(Long usuarioId, Long conteudoId) {
        conteudos.marcarConcluido(usuarioId, existente(conteudoId).id());
    }

    @Override
    public List<ProgressoModulo> progresso(Long usuarioId) {
        Set<Long> concluidos = conteudos.concluidos(usuarioId);
        Map<Long, List<Conteudo>> porModulo = conteudos.listarConteudos().stream()
                .collect(Collectors.groupingBy(Conteudo::moduloId));
        return conteudos.listarModulos().stream().map(m -> {
            List<Conteudo> lista = porModulo.getOrDefault(m.id(), List.of());
            int feitos = (int) lista.stream().filter(c -> concluidos.contains(c.id())).count();
            return new ProgressoModulo(m.id(), m.titulo(), lista.size(), feitos);
        }).toList();
    }

    private Conteudo existente(Long conteudoId) {
        return conteudos.buscarConteudo(conteudoId).orElseThrow(() -> new NaoEncontradoException("Conteúdo não encontrado"));
    }
}
