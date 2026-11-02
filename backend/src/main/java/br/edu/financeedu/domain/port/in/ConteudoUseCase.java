package br.edu.financeedu.domain.port.in;

import br.edu.financeedu.domain.model.Conteudo;
import br.edu.financeedu.domain.model.Modulo;
import br.edu.financeedu.domain.model.ProgressoModulo;

import java.util.List;

public interface ConteudoUseCase {

    record ConteudoDoUsuario(Conteudo conteudo, boolean concluido) {
    }

    List<Modulo> listarModulos();

    List<ConteudoDoUsuario> listarConteudos(Long usuarioId, Long moduloId);

    ConteudoDoUsuario buscar(Long usuarioId, Long conteudoId);

    void concluir(Long usuarioId, Long conteudoId);

    List<ProgressoModulo> progresso(Long usuarioId);
}
