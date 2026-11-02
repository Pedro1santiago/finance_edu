package br.edu.financeedu.adapter.out.persistence;

import br.edu.financeedu.domain.model.Conteudo;
import br.edu.financeedu.domain.model.Modulo;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "modulos")
class ModuloEntity {
    @Id
    Long id;
    String titulo;
    String descricao;
    int ordem;

    Modulo paraDominio() {
        return new Modulo(id, titulo, descricao, ordem);
    }
}

@Entity
@Table(name = "conteudos")
class ConteudoEntity {
    @Id
    Long id;
    Long moduloId;
    String titulo;
    String corpo;
    int ordem;

    Conteudo paraDominio() {
        return new Conteudo(id, moduloId, titulo, corpo, ordem);
    }
}

@Entity
@Table(name = "progresso_conteudos")
class ProgressoConteudoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    Long usuarioId;
    Long conteudoId;
    Instant concluidoEm;
}
