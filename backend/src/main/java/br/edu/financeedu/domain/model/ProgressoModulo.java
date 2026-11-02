package br.edu.financeedu.domain.model;

import java.math.BigDecimal;
import java.math.RoundingMode;

public record ProgressoModulo(Long moduloId, String titulo, int total, int concluidos) {

    public BigDecimal percentual() {
        if (total == 0) return BigDecimal.ZERO;
        return BigDecimal.valueOf(concluidos * 100L).divide(BigDecimal.valueOf(total), 2, RoundingMode.HALF_EVEN);
    }
}
