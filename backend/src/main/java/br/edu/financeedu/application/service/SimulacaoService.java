package br.edu.financeedu.application.service;

import br.edu.financeedu.domain.model.CalculadoraFinanceira;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.Economia;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.Investimento;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.JurosCompostos;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.Parcelamento;
import br.edu.financeedu.domain.model.Simulacao;
import br.edu.financeedu.domain.model.Simulacao.Tipo;
import br.edu.financeedu.domain.port.in.SimulacaoUseCase;
import br.edu.financeedu.domain.port.out.SimulacaoRepositoryPort;

import java.time.Clock;
import java.time.Instant;
import java.util.List;

public class SimulacaoService implements SimulacaoUseCase {

    private final SimulacaoRepositoryPort simulacoes;
    private final Clock clock;

    public SimulacaoService(SimulacaoRepositoryPort simulacoes, Clock clock) {
        this.simulacoes = simulacoes;
        this.clock = clock;
    }

    @Override
    public JurosCompostos jurosCompostos(Long usuarioId, ParamJuros p) {
        return registrar(usuarioId, Tipo.JUROS_COMPOSTOS, p,
                CalculadoraFinanceira.jurosCompostos(p.capital(), p.taxaMensal(), p.meses()));
    }

    @Override
    public Investimento investimento(Long usuarioId, ParamInvestimento p) {
        Investimento r = CalculadoraFinanceira.investimento(p.valorInicial(), p.aporteMensal(), p.taxaMensal(), p.meses());
        // histórico guarda só o resumo; a série mês a mês é recalculável
        simulacoes.salvar(new Simulacao(null, usuarioId, Tipo.INVESTIMENTO, p,
                new Investimento(r.valorInicial(), r.aporteMensal(), r.taxaMensal(), r.meses(),
                        r.saldoFinal(), r.totalInvestido(), r.totalJuros(), List.of()),
                Instant.now(clock)));
        return r;
    }

    @Override
    public Parcelamento parcelamento(Long usuarioId, ParamParcelamento p) {
        return registrar(usuarioId, Tipo.PARCELAMENTO, p,
                CalculadoraFinanceira.parcelamento(p.valor(), p.taxaMensal(), p.parcelas()));
    }

    @Override
    public Economia economia(Long usuarioId, ParamEconomia p) {
        return registrar(usuarioId, Tipo.ECONOMIA, p,
                CalculadoraFinanceira.economia(p.objetivo(), p.economiaMensal(), p.prazoMeses()));
    }

    @Override
    public List<Simulacao> listar(Long usuarioId, int limite) {
        return simulacoes.listarRecentes(usuarioId, Math.clamp(limite, 1, 100));
    }

    private <T> T registrar(Long usuarioId, Tipo tipo, Object parametros, T resultado) {
        simulacoes.salvar(new Simulacao(null, usuarioId, tipo, parametros, resultado, Instant.now(clock)));
        return resultado;
    }
}
