package br.edu.financeedu.domain.port.out;

import br.edu.financeedu.domain.model.Simulacao;

import java.util.List;

public interface SimulacaoRepositoryPort {
    Simulacao salvar(Simulacao simulacao);

    List<Simulacao> listarRecentes(Long usuarioId, int limite);
}
