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
        m.registrarAporte(new BigDecimal("250"), HOJE);
        assertThat(m.totalEconomizado()).isEqualByComparingTo("250");
        assertThat(m.valorRestante()).isEqualByComparingTo("750");
        assertThat(m.percentualAtingido()).isEqualByComparingTo("25.00");
        assertThat(m.status()).isEqualTo(Meta.Status.ATIVA);
    }

    @Test
    void concluiAoAtingirAlvoELimitaPercentual() {
        Meta m = meta("100");
        m.registrarAporte(new BigDecimal("150"), HOJE);
        assertThat(m.status()).isEqualTo(Meta.Status.CONCLUIDA);
        assertThat(m.percentualAtingido()).isEqualByComparingTo("100");
        assertThat(m.valorRestante()).isEqualByComparingTo("0");
        assertThat(m.estimativaConclusao(HOJE)).isNull();
    }

    @Test
    void estimaConclusaoPelaMediaMensal() {
        Meta m = meta("1000");
        m.registrarAporte(new BigDecimal("100"), HOJE);
        m.registrarAporte(new BigDecimal("100"), HOJE.plusMonths(1));
        // 2 meses desde a criação, média 100/mês, faltam 800 -> 8 meses
        LocalDate hoje = HOJE.plusMonths(1);
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
        assertThatThrownBy(() -> meta("10").registrarAporte(BigDecimal.ZERO, HOJE)).isInstanceOf(RegraNegocioException.class);
    }
}
