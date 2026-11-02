import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mensagemErro } from '../auth/auth.service';
import { Aporte, Meta, MetaService } from './meta.service';

@Component({
  selector: 'app-meta-detalhe',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <a routerLink="/metas">Voltar</a>
    @if (erro()) {
      <p role="alert">{{ erro() }}</p>
    }
    @if (meta(); as m) {
      <h2>{{ m.nome }}</h2>
      <p>{{ m.status }} · {{ m.percentualAtingido }}%</p>
      <progress max="100" [value]="m.percentualAtingido"></progress>
      <p>Economizado: {{ m.totalEconomizado | currency: 'BRL' }} de {{ m.valorAlvo | currency: 'BRL' }}</p>
      <p>Restante: {{ m.valorRestante | currency: 'BRL' }}</p>
      <p>Prazo: {{ m.prazo | date: 'dd/MM/yyyy' }}</p>
      @if (m.estimativaConclusao) {
        <p>Estimativa de conclusão: {{ m.estimativaConclusao | date: 'dd/MM/yyyy' }}</p>
      }
      <h3>Aportes</h3>
      <ul>
        @for (a of aportes(); track a.id) {
          <li>{{ a.valor | currency: 'BRL' }} em {{ a.data | date: 'dd/MM/yyyy' }}</li>
        } @empty {
          <li>Nenhum aporte.</li>
        }
      </ul>
    }
  `,
})
export class MetaDetalhe {
  private api = inject(MetaService);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  meta = signal<Meta | null>(null);
  aportes = signal<Aporte[]>([]);
  erro = signal('');

  constructor() {
    this.carregar();
  }

  carregar() {
    forkJoin({ meta: this.api.buscar(this.id), aportes: this.api.aportes(this.id) }).subscribe({
      next: (r) => {
        this.meta.set(r.meta);
        this.aportes.set(r.aportes);
      },
      error: (e) => this.erro.set(e instanceof HttpErrorResponse && e.status === 404 ? 'Meta não encontrada' : mensagemErro(e)),
    });
  }
}
