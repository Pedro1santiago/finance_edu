package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.model.Aporte;
import br.edu.financeedu.domain.model.Dashboard;
import br.edu.financeedu.domain.model.Meta;
import br.edu.financeedu.domain.model.ProgressoModulo;
import br.edu.financeedu.domain.port.in.ConteudoUseCase;
import br.edu.financeedu.domain.port.in.MetaUseCase;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneOffset;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DashboardServiceTest {

    private final Clock clock = Clock.fixed(Instant.parse("2026-03-15T12:00:00Z"), ZoneOffset.UTC);
    private final MetaUseCase metas = mock(MetaUseCase.class);
    private final ConteudoUseCase conteudos = mock(ConteudoUseCase.class);
    private final SimulacaoUseCase simulacoes = mock(SimulacaoUseCase.class);
    private final DashboardService service = new DashboardService(metas, conteudos, simulacoes, clock);

    private Meta meta(String alvo, Aporte... aportes) {
        LocalDate inicio = LocalDate.of(2026, 1, 1);
        return new Meta(1L, 1L, "m", new BigDecimal(alvo), inicio.plusYears(1), inicio, List.of(aportes));
    }

    @Test
    void agregaIndicadores() {
        when(metas.listar(1L)).thenReturn(List.of(
                meta("100", new Aporte(1L, new BigDecimal("100"), LocalDate.of(2026, 2, 1))),
                meta("1000", new Aporte(2L, new BigDecimal("500"), LocalDate.of(2026, 3, 1)))));
        when(conteudos.progresso(1L)).thenReturn(List.of(
                ProgressoModulo.de(1L, "a", 2, 2), ProgressoModulo.de(2L, "b", 2, 0)));
        when(simulacoes.listar(1L, 5)).thenReturn(List.of());

        Dashboard d = service.obter(1L);

        assertThat(d.totalEconomizado()).isEqualByComparingTo("600");
        assertThat(d.metasConcluidas()).isEqualTo(1);
        assertThat(d.metasAtivas()).isEqualTo(1);
        assertThat(d.percentualMedioMetas()).isEqualByComparingTo("75.00");
        assertThat(d.percentualConteudos()).isEqualByComparingTo("50.00");
    }

    @Test
    void evolucaoPreencheMesesSemAporte() {
        when(metas.listar(1L)).thenReturn(List.of(meta("1000",
                new Aporte(1L, new BigDecimal("30"), LocalDate.of(2026, 1, 5)),
                new Aporte(2L, new BigDecimal("20"), LocalDate.of(2026, 1, 20)),
                new Aporte(3L, new BigDecimal("10"), LocalDate.of(2026, 3, 1)))));

        var serie = service.evolucaoAportes(1L, 3);

        assertThat(serie).extracting(Dashboard.AportesDoMes::mes)
                .containsExactly(YearMonth.of(2026, 1), YearMonth.of(2026, 2), YearMonth.of(2026, 3));
        assertThat(serie).extracting(Dashboard.AportesDoMes::total)
                .usingElementComparator(BigDecimal::compareTo)
                .containsExactly(new BigDecimal("50"), BigDecimal.ZERO, new BigDecimal("10"));
    }
}
