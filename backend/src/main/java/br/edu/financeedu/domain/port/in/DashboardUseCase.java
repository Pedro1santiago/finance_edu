package br.edu.financeedu.domain.port.in;

import br.edu.financeedu.domain.model.Dashboard;
import br.edu.financeedu.domain.model.Dashboard.AportesDoMes;

import java.util.List;

public interface DashboardUseCase {
    Dashboard obter(Long usuarioId);

    List<AportesDoMes> evolucaoAportes(Long usuarioId, int meses);
}
