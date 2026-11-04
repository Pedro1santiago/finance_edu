import { Component, OnInit, input, output, signal } from '@angular/core';
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
      <label>Nome <input type="text" name="nome" formControlName="nome" /></label>
      @if (form.controls.nome.touched && form.controls.nome.invalid) {
        <p role="alert">Nome obrigatório.</p>
      }
      <label>Valor alvo <input type="number" step="any" name="valorAlvo" formControlName="valorAlvo" /></label>
      @if (form.controls.valorAlvo.touched && form.controls.valorAlvo.invalid) {
        <p role="alert">Valor alvo deve ser maior que zero.</p>
      }
      <label>Prazo <input type="date" name="prazo" formControlName="prazo" /></label>
      @if (form.controls.prazo.touched && form.controls.prazo.invalid) {
        <p role="alert">Prazo não pode estar no passado.</p>
      }
      @if (erro()) {
        <p role="alert">{{ erro() }}</p>
      }
      <button type="submit" [disabled]="enviando()">Salvar</button>
    </form>
  `,
})
export class FormMeta implements OnInit {
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
