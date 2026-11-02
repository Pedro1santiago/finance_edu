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
    <a [routerLink]="conteudo() ? ['/conteudos/modulos', conteudo()!.moduloId] : '/conteudos'">Voltar</a>
    @if (erro()) {
      <p role="alert">{{ erro() }}</p>
    }
    @if (conteudo(); as c) {
      <h2>{{ c.titulo }}</h2>
      <p>{{ c.corpo }}</p>
    }
  `,
})
export class ConteudoLeitura {
  private api = inject(ConteudoService);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  conteudo = signal<Conteudo | null>(null);
  erro = signal('');

  constructor() {
    this.carregar();
  }

  private carregar() {
    if (!Number.isInteger(this.id) || this.id <= 0) return this.erro.set(naoEncontrado);
    this.api.conteudo(this.id).subscribe({
      next: (c) => this.conteudo.set(c),
      error: (e) => this.erro.set(e instanceof HttpErrorResponse && e.status === 404 ? naoEncontrado : mensagemErro(e)),
    });
  }
}
