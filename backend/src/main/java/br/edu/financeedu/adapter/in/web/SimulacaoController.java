package br.edu.financeedu.adapter.in.web;

import br.edu.financeedu.domain.model.CalculadoraFinanceira.Economia;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.Investimento;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.JurosCompostos;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.Parcelamento;
import br.edu.financeedu.domain.model.Simulacao;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase.ParamEconomia;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase.ParamInvestimento;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase.ParamJuros;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase.ParamParcelamento;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// Validação dos parâmetros fica na CalculadoraFinanceira (422).
@RestController
@RequestMapping("/api/simulacoes")
class SimulacaoController {

    private final SimulacaoUseCase simulacoes;

    SimulacaoController(SimulacaoUseCase simulacoes) {
        this.simulacoes = simulacoes;
    }

    @PostMapping("/juros-compostos")
    JurosCompostos juros(@AuthenticationPrincipal Jwt jwt, @RequestBody ParamJuros p) {
        return simulacoes.jurosCompostos(UsuarioLogado.id(jwt), p);
    }

    @PostMapping("/investimento")
    Investimento investimento(@AuthenticationPrincipal Jwt jwt, @RequestBody ParamInvestimento p) {
        return simulacoes.investimento(UsuarioLogado.id(jwt), p);
    }

    @PostMapping("/parcelamento")
    Parcelamento parcelamento(@AuthenticationPrincipal Jwt jwt, @RequestBody ParamParcelamento p) {
        return simulacoes.parcelamento(UsuarioLogado.id(jwt), p);
    }

    @PostMapping("/economia")
    Economia economia(@AuthenticationPrincipal Jwt jwt, @RequestBody ParamEconomia p) {
        return simulacoes.economia(UsuarioLogado.id(jwt), p);
    }

    @GetMapping
    List<Simulacao> listar(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "20") int limite) {
        return simulacoes.listar(UsuarioLogado.id(jwt), limite);
    }
}
