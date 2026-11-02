package br.edu.financeedu.adapter.in.web;

import br.edu.financeedu.domain.model.Modulo;
import br.edu.financeedu.domain.model.ProgressoModulo;
import br.edu.financeedu.domain.port.in.ConteudoUseCase;
import br.edu.financeedu.domain.port.in.ConteudoUseCase.ConteudoDoUsuario;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
class ConteudoController {

    record ConteudoResponse(Long id, Long moduloId, String titulo, String corpo, int ordem, boolean concluido) {
        static ConteudoResponse de(ConteudoDoUsuario c) {
            var x = c.conteudo();
            return new ConteudoResponse(x.id(), x.moduloId(), x.titulo(), x.corpo(), x.ordem(), c.concluido());
        }
    }

    private final ConteudoUseCase conteudos;

    ConteudoController(ConteudoUseCase conteudos) {
        this.conteudos = conteudos;
    }

    @GetMapping("/modulos")
    List<Modulo> modulos() {
        return conteudos.listarModulos();
    }

    @GetMapping("/modulos/{id}/conteudos")
    List<ConteudoResponse> conteudosDoModulo(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return conteudos.listarConteudos(UsuarioLogado.id(jwt), id).stream().map(ConteudoResponse::de).toList();
    }

    @GetMapping("/conteudos/{id}")
    ConteudoResponse conteudo(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        return ConteudoResponse.de(conteudos.buscar(UsuarioLogado.id(jwt), id));
    }

    @PostMapping("/conteudos/{id}/concluir")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    void concluir(@AuthenticationPrincipal Jwt jwt, @PathVariable Long id) {
        conteudos.concluir(UsuarioLogado.id(jwt), id);
    }

    @GetMapping("/progresso/conteudos")
    List<ProgressoModulo> progresso(@AuthenticationPrincipal Jwt jwt) {
        return conteudos.progresso(UsuarioLogado.id(jwt));
    }
}
