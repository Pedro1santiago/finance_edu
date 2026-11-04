import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { mensagemErro } from '../auth/auth.service';
import { FormMeta } from './form-meta';
import { Meta, MetaIn, MetaService } from './meta.service';

@Component({
  selector: 'app-metas',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, FormMeta, RouterLink],
  template: `
    <h2>Metas</h2>
    <app-form-meta [acao]="criar" (salvo)="carregar()" />
    @if (carregando()) {
      <p>Carregando…</p>
    }
    @if (erro()) {
      <p role="alert">{{ erro() }}</p>
    }
    @for (m of metas(); track m.id) {
      <article>
        <h3><a [routerLink]="[m.id]">{{ m.nome }}</a></h3>
        <p>{{ m.status }} · {{ m.percentualAtingido | number: '1.0-2' }}%</p>
        <progress max="100" [value]="m.percentualAtingido"></progress>
        <p>{{ m.totalEconomizado | currency: 'BRL' }} de {{ m.valorAlvo | currency: 'BRL' }} até {{ m.prazo | date: 'dd/MM/yyyy' }}</p>
        <button type="button" (click)="editando.set(m.id)">Editar</button>
        <button type="button" class="excluir" (click)="excluir(m.id)">Excluir</button>
        @if (editando() === m.id) {
          <app-form-meta [inicial]="m" [acao]="alterar(m.id)" (salvo)="editando.set(null); carregar()" />
        }
      </article>
    } @empty {
      @if (!carregando() && !erro()) {
        <p>Nenhuma meta cadastrada.</p>
      }
    }
  `,
})
export class Metas {
  private api = inject(MetaService);
  metas = signal<Meta[]>([]);
  erro = signal('');
  carregando = signal(true);

  editando = signal<number | null>(null);
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
