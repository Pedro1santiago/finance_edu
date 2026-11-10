import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mensagemErro } from '../auth/auth.service';
import { ConteudoService, Modulo, ProgressoModulo } from './conteudo.service';

@Component({
  selector: 'app-modulos',
  imports: [DecimalPipe, RouterLink],
  template: `
    <div class="page-intro">
      <h1>Conteúdos</h1>
      <p class="page-lead">Aprenda no seu ritmo, módulo a módulo.</p>
    </div>
    @if (carregando()) {
      <p class="page-lead">Carregando…</p>
    }
    @if (erro()) {
      <p role="alert">{{ erro() }}</p>
    }
    <div class="lesson-grid">
      @for (m of modulos(); track m.id) {
        <article class="lesson-card">
          <div class="lesson-top"><span class="lesson-icon lilac" aria-hidden="true">▤</span></div>
          <h3><a [routerLink]="['/conteudos/modulos', m.id]">{{ m.titulo }}</a></h3>
          <p>{{ m.descricao }}</p>
          @if (progresso()[m.id]; as p) {
            <div class="goal-progress" role="progressbar" [attr.aria-label]="m.titulo" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="p.percentual">
              <i [style.width.%]="p.percentual"></i>
            </div>
            <p class="goal-card-foot">{{ p.concluidos }} de {{ p.total }} concluídos · <span class="goal-percent">{{ p.percentual | number: '1.0-2' }}%</span></p>
          }
        </article>
      } @empty {
        @if (!carregando() && !erro()) {
          <p>Nenhum módulo.</p>
        }
      }
    </div>
  `,
})
export class Modulos {
  private api = inject(ConteudoService);
  modulos = signal<Modulo[]>([]);
  progresso = signal<Record<number, ProgressoModulo>>({});
  erro = signal('');
  carregando = signal(true);

  constructor() {
    forkJoin({ modulos: this.api.modulos(), progresso: this.api.progresso() }).subscribe({
      next: (r) => {
        this.modulos.set(r.modulos);
        this.progresso.set(Object.fromEntries(r.progresso.map((p) => [p.moduloId, p])));
        this.carregando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemErro(e));
        this.carregando.set(false);
      },
    });
  }
}
