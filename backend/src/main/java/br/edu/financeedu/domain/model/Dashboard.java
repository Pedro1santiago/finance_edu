package br.edu.financeedu.domain.model;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.List;

public record Dashboard(BigDecimal totalEconomizado, int metasAtivas, int metasConcluidas,
                        BigDecimal percentualMedioMetas, BigDecimal percentualConteudos,
                        List<ProgressoModulo> progressoConteudos, List<Simulacao> ultimasSimulacoes) {

    public record AportesDoMes(YearMonth mes, BigDecimal total) {
    }
}
