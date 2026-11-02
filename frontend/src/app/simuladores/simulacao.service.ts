import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export interface JurosIn { capital: number; taxaMensal: number; meses: number }
export interface JurosOut extends JurosIn { montante: number; juros: number }
export interface InvestimentoIn { valorInicial: number; aporteMensal: number; taxaMensal: number; meses: number }
export interface PontoEvolucao { mes: number; saldo: number; totalInvestido: number; juros: number }
export interface InvestimentoOut extends InvestimentoIn {
  saldoFinal: number;
  totalInvestido: number;
  totalJuros: number;
  evolucao: PontoEvolucao[];
}
export interface ParcelamentoIn { valor: number; taxaMensal: number; parcelas: number }
export interface ParcelamentoOut extends ParcelamentoIn { valorParcela: number; totalPago: number; totalJuros: number }
export interface EconomiaIn { objetivo: number; economiaMensal: number }
export interface EconomiaOut extends EconomiaIn { mesesNecessarios: number; economiaAnual: number }

@Injectable({ providedIn: 'root' })
export class SimulacaoService {
  private http = inject(HttpClient);

  jurosCompostos = (d: JurosIn) => this.post<JurosOut>('juros-compostos', d);
  investimento = (d: InvestimentoIn) => this.post<InvestimentoOut>('investimento', d);
  parcelamento = (d: ParcelamentoIn) => this.post<ParcelamentoOut>('parcelamento', d);
  economia = (d: EconomiaIn) => this.post<EconomiaOut>('economia', d);

  private post<T>(caminho: string, dados: object) {
    return this.http.post<T>(`${environment.apiUrl}/api/simulacoes/${caminho}`, dados);
  }
}
