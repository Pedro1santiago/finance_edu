package br.edu.financeedu.adapter.out.persistence;

import br.edu.financeedu.domain.model.Simulacao;
import br.edu.financeedu.domain.port.out.SimulacaoRepositoryPort;
import org.springframework.data.domain.Limit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import tools.jackson.databind.DeserializationFeature;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;
import java.util.Map;

@Component
class SimulacaoPersistenceAdapter implements SimulacaoRepositoryPort {

    interface Repo extends JpaRepository<SimulacaoEntity, Long> {
        List<SimulacaoEntity> findByUsuarioIdOrderByCriadaEmDesc(Long usuarioId, Limit limit);
    }

    private final Repo repo;
    private final JsonMapper json;

    SimulacaoPersistenceAdapter(Repo repo, JsonMapper json) {
        this.repo = repo;
        this.json = json;
    }

    @Override
    public Simulacao salvar(Simulacao s) {
        SimulacaoEntity e = new SimulacaoEntity();
        e.usuarioId = s.usuarioId();
        e.tipo = s.tipo().name();
        e.parametros = json.writeValueAsString(s.parametros());
        e.resultado = json.writeValueAsString(s.resultado());
        e.criadaEm = s.criadaEm();
        return paraDominio(repo.save(e));
    }

    @Override
    public List<Simulacao> listarRecentes(Long usuarioId, int limite) {
        return repo.findByUsuarioIdOrderByCriadaEmDesc(usuarioId, Limit.of(limite)).stream()
                .map(this::paraDominio).toList();
    }

    private Simulacao paraDominio(SimulacaoEntity e) {
        var leitor = json.readerFor(Map.class).with(DeserializationFeature.USE_BIG_DECIMAL_FOR_FLOATS);
        return new Simulacao(e.id, e.usuarioId, Simulacao.Tipo.valueOf(e.tipo),
                leitor.readValue(e.parametros), leitor.readValue(e.resultado), e.criadaEm);
    }
}
