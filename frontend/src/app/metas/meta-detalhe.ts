import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mensagemErro } from '../auth/auth.service';
import { positivo } from '../simuladores/form-simulador';
import { hoje } from './form-meta';
import { Aporte, Meta, MetaService } from './meta.service';

const naoEncontrada = 'Meta não encontrada';

@Component({
  selector: 'app-meta-detalhe',
  imports: [CurrencyPipe, DatePipe, ReactiveFormsModule, RouterLink],
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
      <form [formGroup]="form" (ngSubmit)="aportar()">
        <label>Valor <input type="number" step="any" name="valor" formControlName="valor" /></label>
        <label>Data <input type="date" name="data" formControlName="data" /></label>
        @if (form.touched && form.invalid) {
          <p role="alert">Informe um valor maior que zero e uma data.</p>
        }
        @if (erroAporte()) {
          <p role="alert">{{ erroAporte() }}</p>
        }
        <button type="submit" [disabled]="enviando()">Registrar aporte</button>
      </form>
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

  enviando = signal(false);
  erroAporte = signal('');
  form = new FormGroup({
    valor: new FormControl<number | null>(null, [Validators.required, positivo]),
    data: new FormControl(hoje(), { nonNullable: true, validators: Validators.required }),
  });

  constructor() {
    this.carregar();
  }

  aportar() {
    this.erroAporte.set('');
    const { valor, data } = this.form.getRawValue();
    if (this.form.invalid || valor === null) return this.form.markAllAsTouched();
    if (this.enviando()) return;
    this.enviando.set(true);
    this.api.registrarAporte(this.id, { valor, data }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.form.controls.valor.reset();
        this.carregar();
      },
      error: (e) => {
        this.erroAporte.set(mensagemErro(e));
        this.enviando.set(false);
      },
    });
  }

  carregar() {
    if (!Number.isInteger(this.id) || this.id <= 0) return this.erro.set(naoEncontrada);
    forkJoin({ meta: this.api.buscar(this.id), aportes: this.api.aportes(this.id) }).subscribe({
      next: (r) => {
        this.erro.set('');
        this.meta.set(r.meta);
        this.aportes.set(r.aportes);
      },
      error: (e) => this.erro.set(e instanceof HttpErrorResponse && e.status === 404 ? naoEncontrada : mensagemErro(e)),
    });
  }
}
