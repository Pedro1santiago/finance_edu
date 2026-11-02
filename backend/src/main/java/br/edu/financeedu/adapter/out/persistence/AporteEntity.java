package br.edu.financeedu.adapter.out.persistence;

import br.edu.financeedu.domain.model.Aporte;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "aportes")
class AporteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    Long metaId;
    BigDecimal valor;
    LocalDate data;

    Aporte paraDominio() {
        return new Aporte(id, valor, data);
    }
}
