package br.edu.financeedu.adapter.out.persistence;

import br.edu.financeedu.domain.model.Conteudo;
import br.edu.financeedu.domain.model.Modulo;
import br.edu.financeedu.domain.port.out.ConteudoRepositoryPort;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Component
class ConteudoPersistenceAdapter implements ConteudoRepositoryPort {

    interface ModuloRepo extends JpaRepository<ModuloEntity, Long> {
    }

    interface ConteudoRepo extends JpaRepository<ConteudoEntity, Long> {
        List<ConteudoEntity> findByModuloIdOrderByOrdem(Long moduloId);
    }

    interface ProgressoRepo extends JpaRepository<ProgressoConteudoEntity, Long> {
        @Query("select p.conteudoId from ProgressoConteudoEntity p where p.usuarioId = :usuarioId")
        List<Long> conteudosConcluidos(Long usuarioId);

        boolean existsByUsuarioIdAndConteudoId(Long usuarioId, Long conteudoId);
    }

    private final ModuloRepo modulos;
    private final ConteudoRepo conteudos;
    private final ProgressoRepo progresso;
    private final Clock clock;

    ConteudoPersistenceAdapter(ModuloRepo modulos, ConteudoRepo conteudos, ProgressoRepo progresso, Clock clock) {
        this.modulos = modulos;
        this.conteudos = conteudos;
        this.progresso = progresso;
        this.clock = clock;
    }

    @Override
    public List<Modulo> listarModulos() {
        return modulos.findAll(Sort.by("ordem")).stream().map(ModuloEntity::paraDominio).toList();
    }

    @Override
    public Optional<Modulo> buscarModulo(Long id) {
        return modulos.findById(id).map(ModuloEntity::paraDominio);
    }

    @Override
    public List<Conteudo> listarConteudos() {
        return conteudos.findAll(Sort.by("moduloId", "ordem")).stream().map(ConteudoEntity::paraDominio).toList();
    }

    @Override
    public List<Conteudo> listarConteudos(Long moduloId) {
        return conteudos.findByModuloIdOrderByOrdem(moduloId).stream().map(ConteudoEntity::paraDominio).toList();
    }

    @Override
    public Optional<Conteudo> buscarConteudo(Long id) {
        return conteudos.findById(id).map(ConteudoEntity::paraDominio);
    }

    @Override
    public Set<Long> concluidos(Long usuarioId) {
        return new HashSet<>(progresso.conteudosConcluidos(usuarioId));
    }

    @Override
    @Transactional
    public void marcarConcluido(Long usuarioId, Long conteudoId) {
        // shortcut: corrida entre duas requisições simultâneas cai na UNIQUE (500); aceitável para o MVP
        if (progresso.existsByUsuarioIdAndConteudoId(usuarioId, conteudoId)) return;
        ProgressoConteudoEntity e = new ProgressoConteudoEntity();
        e.usuarioId = usuarioId;
        e.conteudoId = conteudoId;
        e.concluidoEm = Instant.now(clock);
        progresso.save(e);
    }
}
