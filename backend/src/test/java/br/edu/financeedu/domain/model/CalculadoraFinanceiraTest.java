package br.edu.financeedu.domain.model;

import br.edu.financeedu.domain.exception.RegraNegocioException;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class CalculadoraFinanceiraTest {

    private static BigDecimal bd(String v) {
        return new BigDecimal(v);
    }

    @Test
    void jurosCompostos() {
        var r = CalculadoraFinanceira.jurosCompostos(bd("1000"), bd("1"), 12);
        assertThat(r.montante()).isEqualByComparingTo("1126.83");
        assertThat(r.juros()).isEqualByComparingTo("126.83");
    }

    @Test
    void investimentoComAportesMensais() {
        var r = CalculadoraFinanceira.investimento(bd("0"), bd("100"), bd("1"), 12);
        assertThat(r.saldoFinal()).isEqualByComparingTo("1268.25");
        assertThat(r.totalInvestido()).isEqualByComparingTo("1200.00");
        assertThat(r.evolucao()).hasSize(12);
        assertThat(r.evolucao().getFirst().saldo()).isEqualByComparingTo("100.00");
    }

    @Test
    void investimentoSemJuros() {
        var r = CalculadoraFinanceira.investimento(bd("500"), bd("100"), bd("0"), 5);
        assertThat(r.saldoFinal()).isEqualByComparingTo("1000.00");
        assertThat(r.totalJuros()).isEqualByComparingTo("0");
    }

    @Test
    void parcelamentoPrice() {
        var r = CalculadoraFinanceira.parcelamento(bd("1000"), bd("2"), 12);
        assertThat(r.valorParcela()).isEqualByComparingTo("94.56");
        assertThat(r.totalPago()).isEqualByComparingTo("1134.72");
        assertThat(r.totalJuros()).isEqualByComparingTo("134.72");
    }

    @Test
    void parcelamentoSemJuros() {
        var r = CalculadoraFinanceira.parcelamento(bd("1200"), bd("0"), 12);
        assertThat(r.valorParcela()).isEqualByComparingTo("100.00");
    }

    @Test
    void economiaArredondaMesesParaCima() {
        var r = CalculadoraFinanceira.economia(bd("1000"), bd("300"));
        assertThat(r.mesesNecessarios()).isEqualTo(4);
        assertThat(r.economiaAnual()).isEqualByComparingTo("3600.00");
    }

    @Test
    void rejeitaEntradasInvalidas() {
        assertThatThrownBy(() -> CalculadoraFinanceira.jurosCompostos(bd("0"), bd("1"), 12))
                .isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> CalculadoraFinanceira.parcelamento(bd("100"), bd("-1"), 12))
                .isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> CalculadoraFinanceira.investimento(bd("0"), bd("100"), bd("1"), 0))
                .isInstanceOf(RegraNegocioException.class);
        assertThatThrownBy(() -> CalculadoraFinanceira.economia(null, bd("100")))
                .isInstanceOf(RegraNegocioException.class);
    }
}
