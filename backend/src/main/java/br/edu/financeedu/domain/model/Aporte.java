package br.edu.financeedu.domain.model;

import java.math.BigDecimal;
import java.time.LocalDate;

public record Aporte(Long id, BigDecimal valor, LocalDate data) {
}
