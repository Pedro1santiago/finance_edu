import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mensagemErro } from '../auth/auth.service';
import { Conteudo, ConteudoService } from './conteudo.service';

const naoEncontrado = 'Módulo não encontrado';

@Component({
  selector: 'app-modulo-detalhe',
  imports: [RouterLink],
  template: `
    <a class="text-link" routerLink="/conteudos">Voltar</a>
    @if (erro()) {
      <p role="alert">{{ erro() }}</p>
    }
    @if (titulo()) {
      <div class="page-intro"><h2>{{ titulo() }}</h2></div>
      <ul class="lista">
        @for (c of conteudos(); track c.id) {
          <li class="lesson-card">
            <a [routerLink]="['/conteudos', c.id]">{{ c.titulo }}</a>
            @if (c.concluido) {
              <span class="goal-percent">Concluído</span>
            }
          </li>
        }
      </ul>
    }
  `,
  styles: `
    .lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 13px; }
    .lista li { display: flex; justify-content: space-between; gap: 12px; align-items: center; font-weight: 600; }
  `,
})
export class ModuloDetalhe {
  private api = inject(ConteudoService);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  titulo = signal('');
  conteudos = signal<Conteudo[]>([]);
  erro = signal('');

  constructor() {
    this.carregar();
  }

  private carregar() {
    if (!Number.isInteger(this.id) || this.id <= 0) return this.erro.set(naoEncontrado);
    forkJoin({ modulos: this.api.modulos(), conteudos: this.api.conteudosDoModulo(this.id) }).subscribe({
      next: (r) => {
        const modulo = r.modulos.find((m) => m.id === this.id);
        if (!modulo) return this.erro.set(naoEncontrado);
        this.titulo.set(modulo.titulo);
        this.conteudos.set(r.conteudos);
      },
      error: (e) => this.erro.set(e instanceof HttpErrorResponse && e.status === 404 ? naoEncontrado : mensagemErro(e)),
    });
  }
}
