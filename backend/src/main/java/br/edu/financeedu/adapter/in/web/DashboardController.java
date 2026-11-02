package br.edu.financeedu.adapter.in.web;

import br.edu.financeedu.domain.model.Dashboard;
import br.edu.financeedu.domain.model.Dashboard.AportesDoMes;
import br.edu.financeedu.domain.port.in.DashboardUseCase;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
class DashboardController {

    private final DashboardUseCase dashboard;

    DashboardController(DashboardUseCase dashboard) {
        this.dashboard = dashboard;
    }

    @GetMapping
    Dashboard obter(@AuthenticationPrincipal Jwt jwt) {
        return dashboard.obter(UsuarioLogado.id(jwt));
    }

    @GetMapping("/evolucao-aportes")
    List<AportesDoMes> evolucaoAportes(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "12") int meses) {
        return dashboard.evolucaoAportes(UsuarioLogado.id(jwt), meses);
    }
}
