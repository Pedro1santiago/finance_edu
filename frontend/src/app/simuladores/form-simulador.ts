import { Component, input, signal } from '@angular/core';
import { AbstractControl, FormControl, FormRecord, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Observable } from 'rxjs';
import { mensagemErro } from '../auth/auth.service';

interface Campo<K extends string> {
  nome: K;
  rotulo: string;
  unidade?: string;
  validadores: ValidatorFn[];
}

export const positivo = (c: AbstractControl): ValidationErrors | null => (c.value > 0 ? null : { positivo: true });
export const naoNegativo = [Validators.required, Validators.min(0)];
export const prazo = [Validators.required, Validators.min(1), Validators.max(1200), Validators.pattern(/^\d+$/)];

const preenchido = <K extends string>(v: Record<string, number | null>): v is Record<K, number> =>
  Object.values(v).every((x) => x !== null);

@Component({
  selector: 'app-form-simulador',
  imports: [ReactiveFormsModule],
  template: `
    @let e = estado();
    <div class="simulator-layout">
      <form class="sim-form" [formGroup]="e.form" (ngSubmit)="e.enviar()">
        <div class="field-row">
          @for (c of e.campos; track c.nome) {
            <div class="form-field">
              <label>
                {{ c.rotulo }}
                <span class="input-wrap">
                  @if (c.unidade === 'R$') { <b>R$</b> }
                  <input type="number" step="any" [name]="c.nome" [formControlName]="c.nome" />
                  @if (c.unidade && c.unidade !== 'R$') { <b>{{ c.unidade }}</b> }
                </span>
              </label>
              @if (e.form.controls[c.nome].touched && e.form.controls[c.nome].invalid) {
                <p role="alert">{{ c.rotulo }} inválido.</p>
              }
            </div>
          }
        </div>
        @if (e.erro()) {
          <p role="alert">{{ e.erro() }}</p>
        }
        <button type="submit" class="button button-primary sim-submit" [disabled]="e.enviando()">Simular</button>
      </form>
      <div class="result-card">
        @if (e.resultado()) {
          <ng-content />
        } @else {
          <p>Preencha os campos e clique em Simular para ver o resultado.</p>
        }
      </div>
    </div>
  `,
  styles: `
    label { display: grid; gap: 7px; }
    .form-field p { margin: 0; }
  `,
})
export class FormSimulador {
  estado = input.required<Estado<string, unknown>>();
}

export class Estado<K extends string, R> {
  enviando = signal(false);
  erro = signal('');
  resultado = signal<R | null>(null);
  form: FormRecord<FormControl<number | null>>;

  constructor(
    readonly campos: Campo<K>[],
    private chamar: (v: Record<K, number>) => Observable<R>,
  ) {
    this.form = new FormRecord(Object.fromEntries(campos.map((c) => [c.nome, new FormControl<number | null>(null, c.validadores)])));
  }

  enviar() {
    if (this.enviando()) return;
    this.erro.set('');
    this.resultado.set(null);
    if (this.form.invalid) return this.form.markAllAsTouched();
    const valores = this.form.getRawValue();
    if (!preenchido<K>(valores)) return this.form.markAllAsTouched();
    this.enviando.set(true);
    this.chamar(valores).subscribe({
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
