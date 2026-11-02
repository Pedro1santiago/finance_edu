import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';
import { AporteMes, Dashboard as Dados, DashboardService, TipoSimulacao } from './dashboard.service';

const rotulos: Record<TipoSimulacao, string> = {
  JUROS_COMPOSTOS: 'Juros compostos',
  INVESTIMENTO: 'Investimento',
  PARCELAMENTO: 'Parcelamento',
  ECONOMIA: 'Economia',
};

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, DecimalPipe],
  template: `
    <h2>Dashboard</h2>
    @if (carregando()) {
      <p>Carregando…</p>
    } @else if (dados(); as d) {
      <p>Total economizado: {{ d.totalEconomizado | currency: 'BRL' }}</p>
      <p>Metas ativas: {{ d.metasAtivas }} · Metas concluídas: {{ d.metasConcluidas }}</p>
      <p>Progresso médio das metas: {{ d.percentualMedioMetas | number: '1.0-2' }}%</p>
      <p>Conteúdos concluídos: {{ d.percentualConteudos | number: '1.0-2' }}%</p>
      @for (p of d.progressoConteudos; track p.moduloId) {
        <article>
          <h3>{{ p.titulo }}</h3>
          <progress max="100" [value]="p.percentual"></progress>
          <p>{{ p.concluidos }} de {{ p.total }} concluídos</p>
        </article>
      }
      <h3>Últimas simulações</h3>
      @for (s of d.ultimasSimulacoes; track s.id) {
        <p>{{ rotulos[s.tipo] }} · {{ s.criadaEm | date: 'dd/MM/yyyy' }}</p>
      }
    }
  `,
})
export class Dashboard {
  private api = inject(DashboardService);
  rotulos = rotulos;
  carregando = signal(true);
  dados = signal<Dados | null>(null);
  aportes = signal<AporteMes[]>([]);

  constructor() {
    forkJoin({ dados: this.api.obter(), aportes: this.api.evolucaoAportes(12) }).subscribe((r) => {
      this.dados.set(r.dados);
      this.aportes.set(r.aportes);
      this.carregando.set(false);
    });
  }
}
