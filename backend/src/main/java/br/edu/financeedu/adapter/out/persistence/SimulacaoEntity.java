package br.edu.financeedu.adapter.out.persistence;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;

@Entity
@Table(name = "simulacoes")
class SimulacaoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    Long usuarioId;
    String tipo;
    @JdbcTypeCode(SqlTypes.JSON)
    String parametros;
    @JdbcTypeCode(SqlTypes.JSON)
    String resultado;
    Instant criadaEm;
}
