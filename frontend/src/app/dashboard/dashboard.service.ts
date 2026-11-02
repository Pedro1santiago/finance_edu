import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';
import { ProgressoModulo } from '../conteudos/conteudo.service';

export type TipoSimulacao = 'JUROS_COMPOSTOS' | 'INVESTIMENTO' | 'PARCELAMENTO' | 'ECONOMIA';
export interface SimulacaoResumo { id: number; tipo: TipoSimulacao; criadaEm: string }
export interface Dashboard {
  totalEconomizado: number;
  metasAtivas: number;
  metasConcluidas: number;
  percentualMedioMetas: number;
  percentualConteudos: number;
  progressoConteudos: ProgressoModulo[];
  ultimasSimulacoes: SimulacaoResumo[];
}
export interface AporteMes { mes: string; total: number }

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/dashboard`;

  obter = () => this.http.get<Dashboard>(this.url);
  evolucaoAportes = (meses: number) => this.http.get<AporteMes[]>(`${this.url}/evolucao-aportes`, { params: { meses } });
}
