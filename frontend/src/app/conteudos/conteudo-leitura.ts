import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { mensagemErro } from '../auth/auth.service';
import { Conteudo, ConteudoService } from './conteudo.service';

const naoEncontrado = 'Conteúdo não encontrado';

@Component({
  selector: 'app-conteudo-leitura',
  imports: [RouterLink],
  template: `
    <a class="text-link" [routerLink]="conteudo() ? ['/conteudos/modulos', conteudo()!.moduloId] : '/conteudos'">Voltar</a>
    @if (erro()) {
      <p role="alert">{{ erro() }}</p>
    }
    @if (conteudo(); as c) {
      <article class="lesson-card leitura">
        <h2>{{ c.titulo }}</h2>
        <p>{{ c.corpo }}</p>
        @if (c.concluido) {
          <span class="goal-percent">Concluído</span>
        } @else {
          <button type="button" class="button button-primary" [disabled]="enviando()" (click)="concluir()">Marcar como concluído</button>
        }
      </article>
    }
  `,
  styles: `
    .leitura { margin-top: 13px; white-space: pre-line; }
    .leitura .button { white-space: nowrap; }
  `,
})
export class ConteudoLeitura {
  private api = inject(ConteudoService);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  conteudo = signal<Conteudo | null>(null);
  erro = signal('');
  enviando = signal(false);

  constructor() {
    this.carregar();
  }

  concluir() {
    if (this.enviando()) return;
    this.erro.set('');
    this.enviando.set(true);
    this.api.concluir(this.id).subscribe({
      next: () => {
        this.enviando.set(false);
        this.conteudo.update((c) => c && { ...c, concluido: true });
      },
      error: (e) => {
        this.erro.set(mensagemErro(e));
        this.enviando.set(false);
      },
    });
  }

  private carregar() {
    if (!Number.isInteger(this.id) || this.id <= 0) return this.erro.set(naoEncontrado);
    this.api.conteudo(this.id).subscribe({
      next: (c) => this.conteudo.set(c),
      error: (e) => this.erro.set(e instanceof HttpErrorResponse && e.status === 404 ? naoEncontrado : mensagemErro(e)),
    });
  }
}
