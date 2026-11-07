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
    private static final BigDecimal MAX_VALOR = new BigDecimal("9999999999999.99");
    private static final BigDecimal TAXA_MINIMA_PARCELAMENTO = new BigDecimal("0.0001");

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
                           BigDecimal economiaAnual, BigDecimal valorMensalNecessario) {
    }

    public static JurosCompostos jurosCompostos(BigDecimal capital, BigDecimal taxaMensal, int meses) {
        positivo(capital, "capital");
        taxa(taxaMensal);
        prazo(meses);
        BigDecimal montante = capital.multiply(fator(taxaMensal).pow(meses, MC), MC);
        teto(montante, "montante");
        return new JurosCompostos(capital, taxaMensal, meses, dinheiro(montante), dinheiro(montante.subtract(capital)));
    }

    public static Investimento investimento(BigDecimal valorInicial, BigDecimal aporteMensal,
                                            BigDecimal taxaMensal, int meses) {
        naoNegativo(valorInicial, "valorInicial");
        naoNegativo(aporteMensal, "aporteMensal");
        taxa(taxaMensal);
        prazo(meses);
        BigDecimal fator = fator(taxaMensal);
        BigDecimal saldo = valorInicial;
        BigDecimal investido = valorInicial;
        List<MesInvestimento> evolucao = new ArrayList<>(meses);
        for (int mes = 1; mes <= meses; mes++) {
            // aporte no fim do mês, após render
            saldo = saldo.multiply(fator, MC).add(aporteMensal);
            investido = investido.add(aporteMensal);
            teto(saldo, "saldo");
            evolucao.add(new MesInvestimento(mes, dinheiro(saldo), dinheiro(investido), dinheiro(saldo.subtract(investido))));
        }
        return new Investimento(valorInicial, aporteMensal, taxaMensal, meses,
                dinheiro(saldo), dinheiro(investido), dinheiro(saldo.subtract(investido)), evolucao);
    }

    public static Parcelamento parcelamento(BigDecimal valor, BigDecimal taxaMensal, int parcelas) {
        positivo(valor, "valor");
        taxa(taxaMensal);
        if (taxaMensal.signum() > 0 && taxaMensal.compareTo(TAXA_MINIMA_PARCELAMENTO) < 0) {
            throw new RegraNegocioException("taxaMensal deve ser zero ou ao menos " + TAXA_MINIMA_PARCELAMENTO.toPlainString());
        }
        prazo(parcelas);
        BigDecimal parcela;
        if (taxaMensal.signum() == 0) {
            parcela = valor.divide(BigDecimal.valueOf(parcelas), MC);
        } else {
            BigDecimal i = taxaMensal.divide(CEM, MC);
            BigDecimal desconto = BigDecimal.ONE.subtract(BigDecimal.ONE.divide(fator(taxaMensal).pow(parcelas, MC), MC));
            parcela = valor.multiply(i, MC).divide(desconto, MC);
        }
        BigDecimal total = dinheiro(parcela.multiply(BigDecimal.valueOf(parcelas), MC));
        return new Parcelamento(valor, taxaMensal, parcelas, dinheiro(parcela), total, total.subtract(valor).max(BigDecimal.ZERO));
    }

    public static Economia economia(BigDecimal objetivo, BigDecimal economiaMensal, Integer prazoMeses) {
        positivo(objetivo, "objetivo");
        positivo(economiaMensal, "economiaMensal");
        if (prazoMeses != null) prazo(prazoMeses);
        if (objetivo.compareTo(economiaMensal.multiply(BigDecimal.valueOf(MAX_MESES))) > 0) {
            throw new RegraNegocioException("objetivo exige mais de " + MAX_MESES + " meses de economia");
        }
        BigDecimal meses = objetivo.divide(economiaMensal, 0, RoundingMode.CEILING);
        BigDecimal valorMensal = prazoMeses == null ? null
                : objetivo.divide(BigDecimal.valueOf(prazoMeses), 2, RoundingMode.CEILING);
        return new Economia(objetivo, economiaMensal, meses.intValue(),
                dinheiro(economiaMensal.multiply(BigDecimal.valueOf(12))), valorMensal);
    }

    private static BigDecimal fator(BigDecimal taxaMensal) {
        return BigDecimal.ONE.add(taxaMensal.divide(CEM, MC));
    }

    static BigDecimal dinheiro(BigDecimal valor) {
        return valor.setScale(2, RoundingMode.HALF_EVEN);
    }

    private static void positivo(BigDecimal v, String campo) {
        if (v == null || v.signum() <= 0) throw new RegraNegocioException(campo + " deve ser maior que zero");
        teto(v, campo);
    }

    private static void naoNegativo(BigDecimal v, String campo) {
        if (v == null || v.signum() < 0) throw new RegraNegocioException(campo + " não pode ser negativo");
        teto(v, campo);
    }

    private static void teto(BigDecimal v, String campo) {
        if (v.compareTo(MAX_VALOR) > 0) throw new RegraNegocioException(campo + " deve ser no máximo " + MAX_VALOR.toPlainString());
    }

    private static void taxa(BigDecimal v) {
        if (v == null || v.signum() < 0 || v.compareTo(CEM) > 0) throw new RegraNegocioException("taxaMensal deve estar entre 0 e 100");
    }

    private static void prazo(int meses) {
        if (meses < 1 || meses > MAX_MESES) throw new RegraNegocioException("prazo deve estar entre 1 e " + MAX_MESES + " meses");
    }
}
