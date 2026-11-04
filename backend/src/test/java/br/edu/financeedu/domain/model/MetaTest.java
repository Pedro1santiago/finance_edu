package br.edu.financeedu.domain.model;

import br.edu.financeedu.domain.exception.RegraNegocioException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MetaTest {

    private static final LocalDate HOJE = LocalDate.of(2026, 1, 10);

    private Meta meta(String alvo) {
        return Meta.nova(1L, "Viagem", new BigDecimal(alvo), HOJE.plusMonths(12), HOJE);
    }

    @Test
    void calculaProgresso() {
        Meta m = meta("1000");
        m.registrarAporte(new BigDecimal("250"), HOJE, HOJE);
        assertThat(m.totalEconomizado()).isEqualByComparingTo("250");
        assertThat(m.valorRestante()).isEqualByComparingTo("750");
        assertThat(m.percentualAtingido()).isEqualByComparingTo("25.00");
        assertThat(m.status()).isEqualTo(Meta.Status.ATIVA);
    }

    @Test
    void concluiAoAtingirAlvoELimitaPercentual() {
        Meta m = meta("100");
        m.registrarAporte(new BigDecimal("150"), HOJE, HOJE);
        assertThat(m.status()).isEqualTo(Meta.Status.CONCLUIDA);
        assertThat(m.percentualAtingido()).isEqualByComparingTo("100");
        assertThat(m.valorRestante()).isEqualByComparingTo("0");
        assertThat(m.estimativaConclusao(HOJE)).isNull();
    }

    @Test
    void estimaConclusaoPelaMediaMensal() {
        Meta m = meta("1000");
        m.registrarAporte(new BigDecimal("100"), HOJE, HOJE);
        LocalDate hoje = HOJE.plusMonths(1);
        m.registrarAporte(new BigDecimal("100"), hoje, hoje);
        // 2 meses desde a criação, média 100/mês, faltam 800 -> 8 meses
        assertThat(m.estimativaConclusao(hoje)).isEqualTo(hoje.plusMonths(8));
    }

    @Test
    void semAportesNaoEstima() {
        assertThat(meta("1000").estimativaConclusao(HOJE)).isNull();
    }

    @Test
    void validaDados() {
        assertThatThrownBy(() -> meta("0")).isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> Meta.nova(1L, " ", BigDecimal.TEN, HOJE, HOJE)).isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> Meta.nova(1L, "x", BigDecimal.TEN, HOJE.minusDays(1), HOJE)).isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> meta("10").registrarAporte(BigDecimal.ZERO, HOJE, HOJE)).isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void dinheiroTemNoMaximoDuasCasasETeto() {
        assertThat(meta("9999999999999.99").valorAlvo()).isEqualByComparingTo("9999999999999.99");
        assertThat(meta("10.50").valorAlvo()).isEqualByComparingTo("10.5");
        assertThat(meta("10.100").valorAlvo()).isEqualByComparingTo("10.1");
        assertThatThrownBy(() -> meta("10.001")).isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> meta("10000000000000")).isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> meta("10").registrarAporte(new BigDecimal("1.234"), HOJE, HOJE))
                .isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> meta("10").registrarAporte(new BigDecimal("10000000000000"), HOJE, HOJE))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void nomeAte120CaracteresEPrazoAteAno9999() {
        assertThat(Meta.nova(1L, "a".repeat(120), BigDecimal.TEN, HOJE, HOJE).nome()).hasSize(120);
        assertThatThrownBy(() -> Meta.nova(1L, "a".repeat(121), BigDecimal.TEN, HOJE, HOJE))
                .isInstanceOf(RegraNegocioException.class);
        assertThat(Meta.nova(1L, "x", BigDecimal.TEN, LocalDate.of(9999, 12, 31), HOJE)).isNotNull();
        assertThatThrownBy(() -> Meta.nova(1L, "x", BigDecimal.TEN, LocalDate.of(10000, 1, 1), HOJE))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void prazoAusenteEObrigatorioEAporteFuturoEhRejeitado() {
        assertThatThrownBy(() -> Meta.nova(1L, "x", BigDecimal.TEN, null, HOJE))
                .hasMessage("prazo é obrigatório");
        assertThatThrownBy(() -> meta("10").registrarAporte(BigDecimal.TEN, HOJE.plusDays(1), HOJE))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void alterarSoRejeitaPrazoNoPassadoQuandoOPrazoMudou() {
        Meta m = new Meta(1L, 1L, "Viagem", BigDecimal.TEN, HOJE.minusDays(5), HOJE.minusMonths(1), java.util.List.of());
        m.alterar("Viagem nova", BigDecimal.TEN, HOJE.minusDays(5), HOJE);
        assertThat(m.nome()).isEqualTo("Viagem nova");
        assertThatThrownBy(() -> m.alterar("x", BigDecimal.TEN, HOJE.minusDays(4), HOJE))
                .isInstanceOf(RegraNegocioException.class);
    }

    @Test
    void estimativaNaoArredondaAMediaAntesDeDividir() {
        Meta m = meta("100");
        m.registrarAporte(new BigDecimal("10"), HOJE, HOJE);
        LocalDate hoje = HOJE.plusMonths(2);
        // 10 em 3 meses (média 3,33...), restante 90 -> 90*3/10 = 27 meses exatos
        assertThat(m.estimativaConclusao(hoje)).isEqualTo(hoje.plusMonths(27));
    }
}
