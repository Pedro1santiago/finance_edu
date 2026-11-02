import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, MetaService } from './meta.service';

@Component({
  selector: 'app-metas',
  imports: [CurrencyPipe, DatePipe, RouterLink],
  template: `
    <h2>Metas</h2>
    @for (m of metas(); track m.id) {
      <article>
        <h3><a [routerLink]="[m.id]">{{ m.nome }}</a></h3>
        <p>{{ m.status }} · {{ m.percentualAtingido }}%</p>
        <progress max="100" [value]="m.percentualAtingido"></progress>
        <p>{{ m.totalEconomizado | currency: 'BRL' }} de {{ m.valorAlvo | currency: 'BRL' }} até {{ m.prazo | date }}</p>
      </article>
    } @empty {
      <p>Nenhuma meta cadastrada.</p>
    }
  `,
})
export class Metas {
  private api = inject(MetaService);
  metas = signal<Meta[]>([]);

  constructor() {
    this.carregar();
  }

  carregar() {
    this.api.listar().subscribe((m) => this.metas.set(m));
  }
}
