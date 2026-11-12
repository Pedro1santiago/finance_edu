import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AuthService, mensagemErro } from '../auth/auth.service';
import { AporteMes, Dashboard as Dados, DashboardService, TipoSimulacao } from './dashboard.service';
import { GraficoAportes } from './grafico-aportes';

const rotulos: Record<TipoSimulacao, string> = {
  JUROS_COMPOSTOS: 'Juros compostos',
  INVESTIMENTO: 'Investimento',
  PARCELAMENTO: 'Parcelamento',
  ECONOMIA: 'Economia',
};

@Component({
  selector: 'app-dashboard',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, GraficoAportes, RouterLink],
  template: `
    <div class="welcome-row">
      <div>
        <h1>Olá, <span>{{ nome() }}</span></h1>
        <p class="page-lead">Acompanhe seu progresso financeiro e de estudos.</p>
      </div>
    </div>
    @if (carregando()) {
      <p class="page-lead">Carregando…</p>
    } @else if (erro()) {
      <p role="alert">{{ erro() }}</p>
      <button type="button" class="button button-primary" (click)="carregar()">Tentar novamente</button>
    } @else if (dados(); as d) {
      <div class="dashboard-stats">
        <div class="dash-stat">
          <span class="dash-icon violet" aria-hidden="true">$</span>
          <span class="stat-caption">Total economizado</span>
          <strong>{{ d.totalEconomizado | currency: 'BRL' }}</strong>
        </div>
        <div class="dash-stat">
          <span class="dash-icon aqua" aria-hidden="true">◎</span>
          <span class="stat-caption">Metas ativas</span>
          <strong>{{ d.metasAtivas }}</strong>
          <small>Progresso médio: {{ d.percentualMedioMetas | number: '1.0-2' }}%</small>
        </div>
        <div class="dash-stat">
          <span class="dash-icon amber" aria-hidden="true">✓</span>
          <span class="stat-caption">Metas concluídas</span>
          <strong>{{ d.metasConcluidas }}</strong>
        </div>
        <div class="dash-stat">
          <span class="dash-icon rose" aria-hidden="true">▤</span>
          <span class="stat-caption">Conteúdos concluídos</span>
          <strong>{{ d.percentualConteudos | number: '1.0-2' }}%</strong>
        </div>
      </div>
      <div class="dashboard-grid">
        <section class="dashboard-panel">
          <div class="panel-heading"><div><h2>Aportes por mês</h2><p>Últimos 12 meses</p></div></div>
          <div class="grafico"><app-grafico-aportes [aportes]="aportes()" /></div>
        </section>
        <section class="dashboard-panel">
          <div class="panel-heading"><div><h2>Progresso por módulo</h2><p>Conteúdos concluídos</p></div></div>
          <div class="dashboard-goals">
            @for (p of d.progressoConteudos; track p.moduloId) {
              <div class="dashboard-goal-row">
                <div class="dashboard-goal-name"><span>{{ p.titulo }}</span></div>
                <div class="dashboard-goal-progress" role="progressbar" [attr.aria-label]="p.titulo" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="p.percentual">
                  <i [style.width.%]="p.percentual"></i>
                </div>
                <div class="dashboard-goal-value"><strong>{{ p.concluidos }}</strong> de {{ p.total }} concluídos</div>
              </div>
            }
          </div>
        </section>
      </div>
      <section class="dashboard-panel painel-simulacoes">
        <div class="panel-heading"><div><h2>Últimas simulações</h2></div></div>
        <div class="dashboard-goals">
          @for (s of d.ultimasSimulacoes; track s.id) {
            <div class="linha-simulacao">
              <div class="dashboard-goal-name"><i aria-hidden="true">∿</i><span>{{ rotulos[s.tipo] }}</span></div>
              <div class="dashboard-goal-value">{{ s.criadaEm | date: 'dd/MM/yyyy' }}</div>
            </div>
          } @empty {
            <p class="vazio">Nenhuma simulação ainda. <a class="text-link" routerLink="/simuladores">Ir para simuladores</a></p>
          }
          @if (!d.metasAtivas && !d.metasConcluidas) {
            <p class="vazio"><a class="text-link" routerLink="/metas">Criar uma meta</a></p>
          }
        </div>
      </section>
    }
  `,
  styles: `
    .stat-caption { text-transform: uppercase; }
    .painel-simulacoes { margin-top: 14px; min-height: 0; }
    .linha-simulacao { display: flex; justify-content: space-between; align-items: center; gap: 12px; }
    .vazio { margin: 0; color: var(--muted); font-size: 11px; }
  `,
})
export class Dashboard {
  private api = inject(DashboardService);
  nome = toSignal(inject(AuthService).me().pipe(map((p) => p.nome), catchError(() => of(''))), { initialValue: '' });
  rotulos = rotulos;
  carregando = signal(true);
  erro = signal('');
  dados = signal<Dados | null>(null);
  aportes = signal<AporteMes[]>([]);

  constructor() {
    this.carregar();
  }

  carregar() {
    this.erro.set('');
    this.carregando.set(true);
    forkJoin({ dados: this.api.obter(), aportes: this.api.evolucaoAportes(12) }).subscribe({
      next: (r) => {
        this.dados.set(r.dados);
        this.aportes.set(r.aportes);
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemErro(e));
        this.carregando.set(false);
      },
    });
  }
}
