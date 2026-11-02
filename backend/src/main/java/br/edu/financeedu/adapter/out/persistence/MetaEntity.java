package br.edu.financeedu.adapter.out.persistence;

import br.edu.financeedu.domain.model.Aporte;
import br.edu.financeedu.domain.model.Meta;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "metas")
class MetaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    Long usuarioId;
    String nome;
    BigDecimal valorAlvo;
    LocalDate prazo;
    LocalDate criadaEm;

    // somente leitura: aportes são gravados via AporteEntity
    @OneToMany
    @JoinColumn(name = "meta_id", insertable = false, updatable = false)
    @OrderBy("data, id")
    List<AporteEntity> aportes = new ArrayList<>();

    void copiar(Meta m) {
        usuarioId = m.usuarioId();
        nome = m.nome();
        valorAlvo = m.valorAlvo();
        prazo = m.prazo();
        criadaEm = m.criadaEm();
    }

    Meta paraDominio() {
        List<Aporte> lista = aportes.stream().map(AporteEntity::paraDominio).toList();
        return new Meta(id, usuarioId, nome, valorAlvo, prazo, criadaEm, lista);
    }
}
