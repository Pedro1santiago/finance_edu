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
    <h2>Conteúdos</h2>
    @if (erro()) {
      <p role="alert">{{ erro() }}</p>
    }
    @for (m of modulos(); track m.id) {
      <article>
        <h3><a [routerLink]="['/conteudos/modulos', m.id]">{{ m.titulo }}</a></h3>
        <p>{{ m.descricao }}</p>
        @if (progresso()[m.id]; as p) {
          <progress max="100" [value]="p.percentual"></progress>
          <p>{{ p.concluidos }} de {{ p.total }} concluídos · {{ p.percentual | number: '1.0-2' }}%</p>
        }
      </article>
    } @empty {
      @if (!carregando() && !erro()) {
        <p>Nenhum módulo.</p>
      }
    }
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
