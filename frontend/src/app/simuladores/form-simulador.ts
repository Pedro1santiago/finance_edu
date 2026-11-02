import { Component, input, signal } from '@angular/core';
import { AbstractControl, FormControl, FormRecord, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { mensagemErro } from '../auth/auth.service';

export interface Campo {
  nome: string;
  rotulo: string;
  validadores: ValidatorFn[];
}

export const positivo = (c: AbstractControl): ValidationErrors | null => (c.value > 0 ? null : { positivo: true });
export const naoNegativo = [Validators.required, Validators.min(0)];
export const prazo = [Validators.required, Validators.min(1), Validators.max(1200), Validators.pattern(/^\d+$/)];

@Component({
  selector: 'app-form-simulador',
  imports: [ReactiveFormsModule],
  template: `
    @let e = estado();
    <form [formGroup]="e.form" (ngSubmit)="e.enviar()">
      @for (c of e.campos; track c.nome) {
        <label>{{ c.rotulo }} <input type="number" step="any" [name]="c.nome" [formControlName]="c.nome" /></label>
        @if (e.form.controls[c.nome].touched && e.form.controls[c.nome].invalid) {
          <p role="alert">{{ c.rotulo }} inválido.</p>
        }
      }
      @if (e.erro()) {
        <p role="alert">{{ e.erro() }}</p>
      }
      <button type="submit" [disabled]="e.enviando()">Simular</button>
    </form>
    <ng-content />
  `,
})
export class FormSimulador {
  estado = input.required<Estado<unknown>>();
}

export class Estado<R> {
  enviando = signal(false);
  erro = signal('');
  resultado = signal<R | null>(null);
  form: FormRecord<FormControl<number | null>>;

  constructor(
    readonly campos: Campo[],
    private chamar: (v: Record<string, number>) => Observable<R>,
  ) {
    this.form = new FormRecord(Object.fromEntries(campos.map((c) => [c.nome, new FormControl<number | null>(null, c.validadores)])));
  }

  enviar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    if (this.enviando()) return;
    this.enviando.set(true);
    this.erro.set('');
    this.chamar(this.form.getRawValue() as Record<string, number>).subscribe({
      next: (r) => {
        this.resultado.set(r);
        this.enviando.set(false);
      },
      error: (e) => {
        this.erro.set(mensagemErro(e));
        this.enviando.set(false);
      },
    });
  }
}
