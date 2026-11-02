package br.edu.financeedu.adapter.out.persistence;

import br.edu.financeedu.domain.model.Aporte;
import br.edu.financeedu.domain.model.Meta;
import br.edu.financeedu.domain.port.out.MetaRepositoryPort;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Component
class MetaPersistenceAdapter implements MetaRepositoryPort {

    interface Repo extends JpaRepository<MetaEntity, Long> {
        @EntityGraph(attributePaths = "aportes")
        List<MetaEntity> findByUsuarioIdOrderById(Long usuarioId);

        @EntityGraph(attributePaths = "aportes")
        Optional<MetaEntity> findByIdAndUsuarioId(Long id, Long usuarioId);

        // bulk delete: o banco remove os aportes via ON DELETE CASCADE
        @Modifying
        @Query("delete from MetaEntity m where m.id = :id")
        void excluir(Long id);
    }

    interface AporteRepo extends JpaRepository<AporteEntity, Long> {
    }

    private final Repo repo;
    private final AporteRepo aportes;

    MetaPersistenceAdapter(Repo repo, AporteRepo aportes) {
        this.repo = repo;
        this.aportes = aportes;
    }

    @Override
    @Transactional
    public Meta salvar(Meta meta) {
        MetaEntity e = meta.id() == null ? new MetaEntity() : repo.findById(meta.id()).orElseThrow();
        e.copiar(meta);
        return repo.save(e).paraDominio();
    }

    @Override
    public Aporte salvarAporte(Long metaId, Aporte aporte) {
        AporteEntity e = new AporteEntity();
        e.metaId = metaId;
        e.valor = aporte.valor();
        e.data = aporte.data();
        return aportes.save(e).paraDominio();
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<Meta> buscar(Long id, Long usuarioId) {
        return repo.findByIdAndUsuarioId(id, usuarioId).map(MetaEntity::paraDominio);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Meta> listar(Long usuarioId) {
        return repo.findByUsuarioIdOrderById(usuarioId).stream().map(MetaEntity::paraDominio).toList();
    }

    @Override
    @Transactional
    public void excluir(Long id) {
        repo.excluir(id);
    }
}
