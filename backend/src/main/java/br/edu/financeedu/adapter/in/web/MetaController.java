package br.edu.financeedu.adapter.in.web;

import br.edu.financeedu.domain.model.Aporte;
import br.edu.financeedu.domain.model.Meta;
import br.edu.financeedu.domain.port.in.MetaUseCase;
import br.edu.financeedu.domain.port.in.MetaUseCase.DadosMeta;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

// Validação dos campos fica no modelo Meta (422).
@RestController
@RequestMapping("/api/metas")
class MetaController {

    record AporteRequest(BigDecimal valor, LocalDate data) {
    }

    record MetaResponse(Long id, String nome, BigDecimal valorAlvo, LocalDate prazo, LocalDate criadaEm,
                        BigDecimal totalEconomizado, BigDecimal valorRestante, BigDecimal percentualAtingido,
                        Meta.Status status, LocalDate estimativaConclusao) {
        static MetaResponse de(Meta m, LocalDate hoje) {
            return new MetaResponse(m.id(), m.nome(), m.valorAlvo(), m.prazo(), m.criadaEm(),
                    m.totalEconomizado(), m.valorRestante(), m.percentualAtingido(), m.status(),
                    m.estimativaConclusao(hoje));
        }
    }

    private final MetaUseCase metas;
    private final Clock clock;

    MetaController(MetaUseCase metas, Clock clock) {
        this.metas = metas;
        this.clock = clock;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    MetaResponse criar(@AuthenticationPrincipal Jwt jwt, @RequestBody DadosMeta d) {
        return resposta(metas.criar(UsuarioLogado.id(jwt), d));
    }

    @GetMapping
    List<MetaResponse> listar(@AuthenticationPrincipal Jwt jwt) {
        return metas.listar(UsuarioLogado.id(jwt)).stream().map(this::resposta).toList();
    }

    @GetMapping("/{id}")
    MetaResponse buscar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return resposta(metas.buscar(UsuarioLogado.id(jwt), id));
    }

    @PutMapping("/{id}")
    MetaResponse alterar(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @RequestBody DadosMeta d) {
        return resposta(metas.alterar(UsuarioLogado.id(jwt), id, d));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void excluir(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        metas.excluir(UsuarioLogado.id(jwt), id);
    }

    @PostMapping("/{id}/aportes")
    @ResponseStatus(HttpStatus.CREATED)
    Aporte registrarAporte(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id, @RequestBody AporteRequest r) {
        return metas.registrarAporte(UsuarioLogado.id(jwt), id, r.valor(), r.data());
    }

    @GetMapping("/{id}/aportes")
    List<Aporte> listarAportes(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return metas.buscar(UsuarioLogado.id(jwt), id).aportes();
    }

    private MetaResponse resposta(Meta m) {
        return MetaResponse.de(m, LocalDate.now(clock));
    }
}
