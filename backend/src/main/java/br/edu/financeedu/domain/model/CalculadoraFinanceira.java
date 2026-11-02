package br.edu.financeedu.domain.model;

import br.edu.financeedu.domain.exception.RegraNegocioException;

import java.math.BigDecimal;
import java.math.MathContext;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/** Taxas sempre em percentual ao mês (1 = 1% a.m.). Valores arredondados só no resultado. */
public final class CalculadoraFinanceira {

    private static final MathContext MC = MathContext.DECIMAL128;
    private static final BigDecimal CEM = BigDecimal.valueOf(100);
    private static final int MAX_MESES = 1200;

    private CalculadoraFinanceira() {
    }

    public record JurosCompostos(BigDecimal capital, BigDecimal taxaMensal, int meses,
                                 BigDecimal montante, BigDecimal juros) {
    }

    public record MesInvestimento(int mes, BigDecimal saldo, BigDecimal totalInvestido, BigDecimal juros) {
    }

    public record Investimento(BigDecimal valorInicial, BigDecimal aporteMensal, BigDecimal taxaMensal, int meses,
                               BigDecimal saldoFinal, BigDecimal totalInvestido, BigDecimal totalJuros,
                               List<MesInvestimento> evolucao) {
    }

    public record Parcelamento(BigDecimal valor, BigDecimal taxaMensal, int parcelas,
                               BigDecimal valorParcela, BigDecimal totalPago, BigDecimal totalJuros) {
    }

    public record Economia(BigDecimal objetivo, BigDecimal economiaMensal, int mesesNecessarios,
                           BigDecimal economiaAnual) {
    }

    public static JurosCompostos jurosCompostos(BigDecimal capital, BigDecimal taxaMensal, int meses) {
        positivo(capital, "capital");
        naoNegativo(taxaMensal, "taxaMensal");
        prazo(meses);
        BigDecimal montante = capital.multiply(fator(taxaMensal).pow(meses, MC), MC);
        return new JurosCompostos(capital, taxaMensal, meses, dinheiro(montante), dinheiro(montante.subtract(capital)));
    }

    public static Investimento investimento(BigDecimal valorInicial, BigDecimal aporteMensal,
                                            BigDecimal taxaMensal, int meses) {
        naoNegativo(valorInicial, "valorInicial");
        naoNegativo(aporteMensal, "aporteMensal");
        naoNegativo(taxaMensal, "taxaMensal");
        prazo(meses);
        BigDecimal fator = fator(taxaMensal);
        BigDecimal saldo = valorInicial;
        BigDecimal investido = valorInicial;
        List<MesInvestimento> evolucao = new ArrayList<>(meses);
        for (int mes = 1; mes <= meses; mes++) {
            // aporte no fim do mês, após render
            saldo = saldo.multiply(fator, MC).add(aporteMensal);
            investido = investido.add(aporteMensal);
            evolucao.add(new MesInvestimento(mes, dinheiro(saldo), dinheiro(investido), dinheiro(saldo.subtract(investido))));
        }
        return new Investimento(valorInicial, aporteMensal, taxaMensal, meses,
                dinheiro(saldo), dinheiro(investido), dinheiro(saldo.subtract(investido)), evolucao);
    }

    public static Parcelamento parcelamento(BigDecimal valor, BigDecimal taxaMensal, int parcelas) {
        positivo(valor, "valor");
        naoNegativo(taxaMensal, "taxaMensal");
        prazo(parcelas);
        BigDecimal parcela;
        if (taxaMensal.signum() == 0) {
            parcela = valor.divide(BigDecimal.valueOf(parcelas), MC);
        } else {
            BigDecimal i = taxaMensal.divide(CEM, MC);
            BigDecimal desconto = BigDecimal.ONE.subtract(BigDecimal.ONE.divide(fator(taxaMensal).pow(parcelas, MC), MC));
            parcela = valor.multiply(i, MC).divide(desconto, MC);
        }
        BigDecimal parcelaArredondada = dinheiro(parcela);
        BigDecimal total = parcelaArredondada.multiply(BigDecimal.valueOf(parcelas));
        return new Parcelamento(valor, taxaMensal, parcelas, parcelaArredondada, total, total.subtract(valor));
    }

    public static Economia economia(BigDecimal objetivo, BigDecimal economiaMensal) {
        positivo(objetivo, "objetivo");
        positivo(economiaMensal, "economiaMensal");
        int meses = objetivo.divide(economiaMensal, 0, RoundingMode.CEILING).intValueExact();
        return new Economia(objetivo, economiaMensal, meses, dinheiro(economiaMensal.multiply(BigDecimal.valueOf(12))));
    }

    private static BigDecimal fator(BigDecimal taxaMensal) {
        return BigDecimal.ONE.add(taxaMensal.divide(CEM, MC));
    }

    static BigDecimal dinheiro(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_EVEN);
    }

    private static void positivo(BigDecimal v, String campo) {
        if (v == null || v.signum() <= 0) throw new RegraNegocioException(campo + " deve ser maior que zero");
    }

    private static void naoNegativo(BigDecimal v, String campo) {
        if (v == null || v.signum() < 0) throw new RegraNegocioException(campo + " não pode ser negativo");
    }

    private static void prazo(int meses) {
        if (meses < 1 || meses > MAX_MESES) throw new RegraNegocioException("prazo deve estar entre 1 e " + MAX_MESES + " meses");
    }
}
