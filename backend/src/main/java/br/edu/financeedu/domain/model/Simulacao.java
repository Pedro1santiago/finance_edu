package br.edu.financeedu.domain.model;

import java.time.Instant;

/** parametros/resultado são records da calculadora ao criar e mapas genéricos ao ler do banco. */
public record Simulacao(Long id, Long usuarioId, Tipo tipo, Object parametros, Object resultado, Instant criadaEm) {

    public enum Tipo { JUROS_COMPOSTOS, INVESTIMENTO, PARCELAMENTO, ECONOMIA }
}
