package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.exception.RegraNegocioException;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.Investimento;
import br.edu.financeedu.domain.model.Simulacao;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase.ParamEconomia;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase.ParamInvestimento;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase.ParamJuros;
import br.edu.financeedu.domain.port.out.SimulacaoRepositoryPort;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

class SimulacaoServiceTest {

    private final Instant agora = Instant.parse("2026-03-15T12:00:00Z");
    private final SimulacaoRepositoryPort repo = mock(SimulacaoRepositoryPort.class);
    private final SimulacaoService service = new SimulacaoService(repo, Clock.fixed(agora, ZoneOffset.UTC));

    private Simulacao salva() {
        var captor = ArgumentCaptor.forClass(Simulacao.class);
        verify(repo).salvar(captor.capture());
        return captor.getValue();
    }

    @Test
    void jurosCompostosCalculaEGravaNoHistorico() {
        var r = service.jurosCompostos(5L, new ParamJuros(new BigDecimal("1000"), BigDecimal.ONE, 12));

        assertThat(r.montante()).isEqualByComparingTo("1126.83");
        Simulacao s = salva();
        assertThat(s.usuarioId()).isEqualTo(5L);
        assertThat(s.tipo()).isEqualTo(Simulacao.Tipo.JUROS_COMPOSTOS);
        assertThat(s.resultado()).isEqualTo(r);
        assertThat(s.criadaEm()).isEqualTo(agora);
    }

    @Test
    void investimentoDevolveSerieMasGravaSoOResumo() {
        var r = service.investimento(5L, new ParamInvestimento(BigDecimal.ZERO, new BigDecimal("100"), BigDecimal.ONE, 12));

        assertThat(r.evolucao()).hasSize(12);
        assertThat(((Investimento) salva().resultado()).evolucao()).isEmpty();
    }

    @Test
    void entradaInvalidaNaoGrava() {
        assertThatThrownBy(() -> service.economia(5L, new ParamEconomia(BigDecimal.ZERO, BigDecimal.TEN, null)))
                .isInstanceOf(RegraNegocioException.class);
        verify(repo, never()).salvar(any());
    }

    @Test
    void listarLimitaEntre1e100() {
        service.listar(5L, 1000);
        service.listar(5L, 0);
        verify(repo).listarRecentes(5L, 100);
        verify(repo).listarRecentes(5L, 1);
    }
}
