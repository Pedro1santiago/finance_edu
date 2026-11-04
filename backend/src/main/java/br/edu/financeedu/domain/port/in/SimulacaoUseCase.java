package br.edu.financeedu.domain.port.in;

import br.edu.financeedu.domain.model.CalculadoraFinanceira.Economia;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.Investimento;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.JurosCompostos;
import br.edu.financeedu.domain.model.CalculadoraFinanceira.Parcelamento;
import br.edu.financeedu.domain.model.Simulacao;

import java.math.BigDecimal;
import java.util.List;

public interface SimulacaoUseCase {

    record ParamJuros(BigDecimal capital, BigDecimal taxaMensal, int meses) {
    }

    record ParamInvestimento(BigDecimal valorInicial, BigDecimal aporteMensal, BigDecimal taxaMensal, int meses) {
    }

    record ParamParcelamento(BigDecimal valor, BigDecimal taxaMensal, int parcelas) {
    }

    record ParamEconomia(BigDecimal objetivo, BigDecimal economiaMensal, Integer prazoMeses) {
    }

    JurosCompostos jurosCompostos(Long usuarioId, ParamJuros p);

    Investimento investimento(Long usuarioId, ParamInvestimento p);

    Parcelamento parcelamento(Long usuarioId, ParamParcelamento p);

    Economia economia(Long usuarioId, ParamEconomia p);

    List<Simulacao> listar(Long usuarioId, int limite);
}
