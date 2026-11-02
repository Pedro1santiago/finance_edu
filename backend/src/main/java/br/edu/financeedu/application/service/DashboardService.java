package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.model.Aporte;
import br.edu.financeedu.domain.model.Dashboard;
import br.edu.financeedu.domain.model.Dashboard.AportesDoMes;
import br.edu.financeedu.domain.model.Meta;
import br.edu.financeedu.domain.model.ProgressoModulo;
import br.edu.financeedu.domain.port.in.ConteudoUseCase;
import br.edu.financeedu.domain.port.in.DashboardUseCase;
import br.edu.financeedu.domain.port.in.MetaUseCase;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Clock;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/** Agrega os outros casos de uso; não tem persistência própria. */
public class DashboardService implements DashboardUseCase {

    private static final int ULTIMAS_SIMULACOES = 5;

    private final MetaUseCase metas;
    private final ConteudoUseCase conteudos;
    private final SimulacaoUseCase simulacoes;
    private final Clock clock;

    public DashboardService(MetaUseCase metas, ConteudoUseCase conteudos, SimulacaoUseCase simulacoes, Clock clock) {
        this.metas = metas;
        this.conteudos = conteudos;
        this.simulacoes = simulacoes;
        this.clock = clock;
    }

    @Override
    public Dashboard obter(Long usuarioId) {
        List<Meta> lista = metas.listar(usuarioId);
        List<ProgressoModulo> progresso = conteudos.progresso(usuarioId);

        BigDecimal total = lista.stream().map(Meta::totalEconomizado).reduce(BigDecimal.ZERO, BigDecimal::add);
        int concluidas = (int) lista.stream().filter(m -> m.status() == Meta.Status.CONCLUIDA).count();
        BigDecimal mediaMetas = lista.isEmpty() ? BigDecimal.ZERO
                : lista.stream().map(Meta::percentualAtingido).reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(lista.size()), 2, RoundingMode.HALF_EVEN);

        int totalConteudos = progresso.stream().mapToInt(ProgressoModulo::total).sum();
        int feitos = progresso.stream().mapToInt(ProgressoModulo::concluidos).sum();
        BigDecimal pctConteudos = ProgressoModulo.percentual(feitos, totalConteudos);

        return new Dashboard(total, lista.size() - concluidas, concluidas, mediaMetas, pctConteudos,
                progresso, simulacoes.listar(usuarioId, ULTIMAS_SIMULACOES));
    }

    @Override
    public List<AportesDoMes> evolucaoAportes(Long usuarioId, int meses) {
        int n = Math.clamp(meses, 1, 60);
        YearMonth atual = YearMonth.now(clock);
        Map<YearMonth, BigDecimal> porMes = metas.listar(usuarioId).stream()
                .flatMap(m -> m.aportes().stream())
                .collect(Collectors.groupingBy(a -> YearMonth.from(a.data()),
                        Collectors.reducing(BigDecimal.ZERO, Aporte::valor, BigDecimal::add)));
        // meses sem aporte entram com zero para o gráfico não pular
        return IntStream.range(0, n)
                .mapToObj(i -> atual.minusMonths(n - 1 - i))
                .map(mes -> new AportesDoMes(mes, porMes.getOrDefault(mes, BigDecimal.ZERO)))
                .toList();
    }
}
