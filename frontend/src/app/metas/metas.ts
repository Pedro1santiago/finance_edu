import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemErro } from '../auth/auth.service';
import { FormMeta } from './form-meta';
import { Meta, MetaIn, MetaService } from './meta.service';

@Component({
  selector: 'app-metas',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, FormMeta, RouterLink],
  host: { '(document:keydown.escape)': 'modal.set(null)' },
  template: `
    <div class="page-intro intro-with-action">
      <div>
        <h1>Metas</h1>
        <p class="page-lead">Defina objetivos e acompanhe cada aporte.</p>
      </div>
      <button type="button" class="button button-primary" (click)="modal.set('nova')"><span aria-hidden="true">+</span> Nova meta</button>
    </div>
    <div class="goal-summary">
      <div class="goal-summary-icon" aria-hidden="true">$</div>
      <div><span>TOTAL ECONOMIZADO</span><strong>{{ resumo().total | currency: 'BRL' }}</strong></div>
      <div class="goal-summary-separator"></div>
      <div><span>METAS ATIVAS</span><strong data-ativas>{{ resumo().ativas }}</strong></div>
      <div class="goal-summary-separator"></div>
      <div><span>CONCLUÍDAS</span><strong data-concluidas>{{ resumo().concluidas }}</strong></div>
    </div>
    @if (carregando()) {
      <p class="page-lead">Carregando…</p>
    }
    @if (erro()) {
      <p role="alert">{{ erro() }}</p>
    }
    <div class="goal-grid secao">
      @for (m of metas(); track m.id) {
        <article class="goal-card">
          <div class="goal-card-top">
            <div class="goal-info">
              <h3><a [routerLink]="[m.id]">{{ m.nome }}</a></h3>
              <span>{{ m.status }} · até {{ m.prazo | date: 'dd/MM/yyyy' }}</span>
            </div>
            <div class="goal-menu">
              <button type="button" (click)="modal.set(m)">Editar</button>
              <button type="button" class="excluir" (click)="excluir(m.id)">Excluir</button>
            </div>
          </div>
          <div class="goal-amounts">
            <span><strong>{{ m.totalEconomizado | currency: 'BRL' }}</strong> de {{ m.valorAlvo | currency: 'BRL' }}</span>
          </div>
          <div class="goal-progress" role="progressbar" [attr.aria-label]="m.nome" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="m.percentualAtingido">
            <i [style.width.%]="m.percentualAtingido"></i>
          </div>
          <div class="goal-card-foot">
            <span class="goal-percent">{{ m.percentualAtingido | number: '1.0-2' }}%</span>
            @if (m.estimativaConclusao) {
              <span>Estimativa: {{ m.estimativaConclusao | date: 'dd/MM/yyyy' }}</span>
            }
          </div>
        </article>
      } @empty {
        @if (!carregando() && !erro()) {
          <div class="empty-state">
            <div class="empty-icon" aria-hidden="true">◎</div>
            <h3>Nenhuma meta cadastrada.</h3>
            <p>Crie sua primeira meta para acompanhar seus aportes.</p>
          </div>
        }
      }
    </div>
    @if (modal(); as m) {
      <div class="modal-backdrop">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="titulo-modal">
          <div class="modal-heading">
            <h2 id="titulo-modal">{{ m === 'nova' ? 'Nova meta' : 'Editar meta' }}</h2>
            <button type="button" class="modal-close" aria-label="Fechar" (click)="modal.set(null)">×</button>
          </div>
          <app-form-meta [inicial]="m === 'nova' ? undefined : m" [acao]="m === 'nova' ? criar : alterar(m.id)" (salvo)="modal.set(null); carregar()" (cancelar)="modal.set(null)" />
        </div>
      </div>
    }
  `,
  styles: `
    .secao { margin-top: 20px; }
    .goal-summary { flex-wrap: wrap; }
    .goal-card h3 { margin: 2px 0 4px; font-size: 13px; }
  `,
})
export class Metas {
  private api = inject(MetaService);
  metas = signal<Meta[]>([]);
  erro = signal('');
  carregando = signal(true);
  modal = signal<Meta | 'nova' | null>(null);

  resumo = computed(() => {
    const m = this.metas();
    return {
      total: m.reduce((s, x) => s + x.totalEconomizado, 0),
      ativas: m.filter((x) => x.status === 'ATIVA').length,
      concluidas: m.filter((x) => x.status === 'CONCLUIDA').length,
    };
  });

  criar = (d: MetaIn) => this.api.criar(d);
  alterar = (id: number) => (d: MetaIn) => this.api.alterar(id, d);

  excluir(id: number) {
    if (!confirm('Excluir esta meta?')) return;
    this.erro.set('');
    this.api.excluir(id).subscribe({ next: () => this.carregar(), error: (e) => this.erro.set(mensagemErro(e)) });
  }

  constructor() {
    this.carregar();
  }

  carregar() {
    this.api.listar().subscribe({
      next: (m) => {
        this.erro.set('');
        this.metas.set(m);
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemErro(e));
        this.carregando.set(false);
      },
    });
  }
}
