package br.edu.financeedu.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record ProgressoModulo(Long moduloId, String titulo, int total, int concluidos, BigDecimal percentual) {

    public static ProgressoModulo de(Long moduloId, String titulo, int total, int concluidos) {
        return new ProgressoModulo(moduloId, titulo, total, concluidos, percentual(concluidos, total));
    }

    public static BigDecimal percentual(int concluidos, int total) {
        if (total == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(concluidos * 100L).divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_EVEN);
    }
}
