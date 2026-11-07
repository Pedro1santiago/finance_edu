package br.edu.financeedu.adapter.out.persistence;

import br.edu.financeedu.domain.exception.RegraNegocioException;
import br.edu.financeedu.domain.model.Usuario;
import br.edu.financeedu.domain.port.out.UsuarioRepositoryPort;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
class UsuarioPersistenceAdapter implements UsuarioRepositoryPort {

    interface Repo extends JpaRepository<UsuarioEntity, Long> {
        Optional<UsuarioEntity> findByEmail(String email);
    }

    private final Repo repo;

    UsuarioPersistenceAdapter(Repo repo) {
        this.repo = repo;
    }

    @Override
    public Usuario salvar(Usuario usuario) {
        try {
            return repo.saveAndFlush(UsuarioEntity.de(usuario)).paraDominio();
        } catch (DataIntegrityViolationException e) {
            if (!String.valueOf(e.getMostSpecificCause().getMessage()).contains("usuarios_email_key")) throw e;
            throw new RegraNegocioException("Email já cadastrado");
        }
    }

    @Override
    public Optional<Usuario> buscarPorEmail(String email) {
        return repo.findByEmail(email).map(UsuarioEntity::paraDominio);
    }

    @Override
    public Optional<Usuario> buscarPorId(Long id) {
        return repo.findById(id).map(UsuarioEntity::paraDominio);
    }
}
