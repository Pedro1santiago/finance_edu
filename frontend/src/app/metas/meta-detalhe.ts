import { HttpErrorResponse } from '@angular/common/http';
import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { mensagemErro } from '../auth/auth.service';
import { positivo } from '../simuladores/form-simulador';
import { hoje } from './form-meta';
import { Aporte, Meta, MetaService, rotuloStatus } from './meta.service';

const naoEncontrada = 'Meta não encontrada';

@Component({
  selector: 'app-meta-detalhe',
  imports: [CurrencyPipe, DatePipe, DecimalPipe, ReactiveFormsModule, RouterLink],
  template: `
    <a class="text-link" routerLink="/metas">Voltar</a>
    @if (erro()) {
      <p role="alert">{{ erro() }}</p>
    }
    @if (meta(); as m) {
      <div class="page-intro"><h2>{{ m.nome }}</h2></div>
      <article class="goal-card">
        <span class="goal-percent">{{ rotuloStatus[m.status] }}</span>
        <div class="goal-amounts">
          <span>Economizado: <strong>{{ m.totalEconomizado | currency: 'BRL' }}</strong> de {{ m.valorAlvo | currency: 'BRL' }}</span>
          <span>Restante: <strong>{{ m.valorRestante | currency: 'BRL' }}</strong></span>
        </div>
        <div class="goal-progress" role="progressbar" [attr.aria-label]="m.nome" aria-valuemin="0" aria-valuemax="100" [attr.aria-valuenow]="m.percentualAtingido">
          <i [style.width.%]="m.percentualAtingido"></i>
        </div>
        <div class="goal-card-foot">
          <span class="goal-percent">{{ m.percentualAtingido | number: '1.0-2' }}%</span>
          <span>Prazo: {{ m.prazo | date: 'dd/MM/yyyy' }}</span>
          @if (m.estimativaConclusao) {
            <span>Estimativa de conclusão: {{ m.estimativaConclusao | date: 'dd/MM/yyyy' }}</span>
          }
        </div>
      </article>
      <section class="dashboard-panel painel">
        <div class="panel-heading"><div><h3>Registrar aporte</h3></div></div>
        <form class="sim-form" [formGroup]="form" (ngSubmit)="aportar()">
          <div class="field-row">
            <label class="form-field">Valor <input class="text-input" type="number" step="any" name="valor" formControlName="valor" /></label>
            <label class="form-field">Data <input class="text-input" type="date" name="data" formControlName="data" /></label>
          </div>
          @if (form.touched && form.invalid) {
            <p role="alert">Informe um valor maior que zero e uma data.</p>
          }
          @if (erroAporte()) {
            <p role="alert">{{ erroAporte() }}</p>
          }
          <button type="submit" class="button button-primary" [disabled]="enviando()">Registrar aporte</button>
        </form>
      </section>
      <section class="dashboard-panel painel">
        <div class="panel-heading"><div><h3>Aportes</h3></div></div>
        <ul class="aportes">
          @for (a of aportes(); track a.id) {
            <li>{{ a.valor | currency: 'BRL' }} em {{ a.data | date: 'dd/MM/yyyy' }}</li>
          } @empty {
            <li>Nenhum aporte.</li>
          }
        </ul>
      </section>
    }
  `,
  styles: `
    .goal-card, .painel { margin-top: 14px; }
    .painel { min-height: 0; }
    .sim-form { padding: 12px 0 0; }
    .aportes { list-style: none; margin: 12px 0 0; padding: 0; display: grid; gap: 8px; }
  `,
})
export class MetaDetalhe {
  private api = inject(MetaService);
  private id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));
  rotuloStatus = rotuloStatus;
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
        this.form.reset({ valor: null, data });
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
