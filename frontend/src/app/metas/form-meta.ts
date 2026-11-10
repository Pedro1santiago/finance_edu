import { Component, ElementRef, OnInit, afterNextRender, input, output, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { mensagemErro } from '../auth/auth.service';
import { positivo } from '../simuladores/form-simulador';
import { MetaIn } from './meta.service';

export const hoje = () => new Date().toLocaleDateString('sv');
const prazoFuturo = (c: AbstractControl): ValidationErrors | null => (c.value >= hoje() ? null : { prazo: true });

@Component({
  selector: 'app-form-meta',
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="enviar()">
      <label class="form-field">Nome <input #nome class="text-input" type="text" name="nome" formControlName="nome" /></label>
      @if (form.controls.nome.touched && form.controls.nome.invalid) {
        <p role="alert">Nome obrigatório.</p>
      }
      <div class="field-row">
        <label class="form-field">Valor alvo <input class="text-input" type="number" step="any" name="valorAlvo" formControlName="valorAlvo" /></label>
        <label class="form-field">Prazo <input class="text-input" type="date" name="prazo" formControlName="prazo" /></label>
      </div>
      @if (form.controls.valorAlvo.touched && form.controls.valorAlvo.invalid) {
        <p role="alert">Valor alvo deve ser maior que zero.</p>
      }
      @if (form.controls.prazo.touched && form.controls.prazo.invalid) {
        <p role="alert">Prazo não pode estar no passado.</p>
      }
      @if (erro()) {
        <p role="alert">{{ erro() }}</p>
      }
      <div class="modal-actions">
        <button type="button" class="button button-quiet" (click)="cancelar.emit()">Cancelar</button>
        <button type="submit" class="button button-primary" [disabled]="enviando()">Salvar</button>
      </div>
    </form>
  `,
})
export class FormMeta implements OnInit {
  private nome = viewChild.required<ElementRef<HTMLInputElement>>('nome');
  cancelar = output();

  constructor() {
    afterNextRender(() => this.nome().nativeElement.focus());
  }

  acao = input.required<(d: MetaIn) => Observable<unknown>>();
  inicial = input<MetaIn>();
  salvo = output();
  enviando = signal(false);
  erro = signal('');
  form = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    valorAlvo: new FormControl<number | null>(null, [Validators.required, positivo]),
    prazo: new FormControl('', { nonNullable: true, validators: [Validators.required, prazoFuturo] }),
  });

  ngOnInit() {
    const i = this.inicial();
    if (i) this.form.setValue({ nome: i.nome, valorAlvo: i.valorAlvo, prazo: i.prazo });
  }

  enviar() {
    this.erro.set('');
    const { nome, valorAlvo, prazo } = this.form.getRawValue();
    if (this.form.invalid || valorAlvo === null) return this.form.markAllAsTouched();
    if (this.enviando()) return;
    this.enviando.set(true);
    this.acao()({ nome, valorAlvo, prazo }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.form.reset();
        this.salvo.emit();
      },
      error: (e) => {
        this.erro.set(mensagemErro(e));
        this.enviando.set(false);
      },
    });
  }
}
