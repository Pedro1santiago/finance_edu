package br.edu.financeedu.adapter.out.persistence;

import br.edu.financeedu.domain.model.Usuario;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "usuarios")
class UsuarioEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;
    String nome;
    String email;
    String senhaHash;
    Instant criadoEm;

    static UsuarioEntity de(Usuario u) {
        UsuarioEntity e = new UsuarioEntity();
        e.id = u.id();
        e.nome = u.nome();
        e.email = u.email();
        e.senhaHash = u.senhaHash();
        e.criadoEm = u.criadoEm();
        return e;
    }

    Usuario paraDominio() {
        return new Usuario(id, nome, email, senhaHash, criadoEm);
    }
}
