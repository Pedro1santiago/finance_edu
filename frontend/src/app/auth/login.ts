import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, mensagemErro } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <div class="modal">
      <div class="brand">
        <div class="brand-mark">F</div>
        <div class="brand-name">Finance<span>Edu</span></div>
      </div>
      <h1>Entrar</h1>
      <form [formGroup]="form" (ngSubmit)="enviar()">
        <label class="form-field">Email <input class="text-input" name="email" type="email" formControlName="email" autocomplete="email" /></label>
        @if (form.controls.email.touched && form.controls.email.invalid) {
          <p role="alert">Informe um email válido (até 180 caracteres).</p>
        }
        <label class="form-field">Senha <input class="text-input" name="senha" type="password" formControlName="senha" autocomplete="current-password" /></label>
        @if (form.controls.senha.touched && form.controls.senha.invalid) {
          <p role="alert">A senha deve ter de 8 a 72 caracteres.</p>
        }
        @if (erro()) {
          <p role="alert">{{ erro() }}</p>
        }
        <button type="submit" class="button button-primary" [disabled]="enviando()">Entrar</button>
      </form>
      <p class="page-lead">Não tem conta? <a class="text-link" routerLink="/cadastro">Cadastre-se</a></p>
    </div>
  `,
  styles: `
    :host { display: grid; place-items: center; min-height: 100vh; padding: 18px; }
    .brand { padding: 0; margin-bottom: 22px; }
    form { display: grid; margin: 18px 0; }
    form .button { width: 100%; }
  `,
})
export class Login {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  erro = signal('');
  enviando = signal(false);
  form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });

  // so caminhos internos: evita open redirect
  private destino() {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && /^\/(?![/\\])/.test(url) ? url : '/dashboard';
  }

  enviar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    if (this.enviando()) return;
    this.enviando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(this.destino()),
      error: (e) => {
        this.erro.set(mensagemErro(e));
        this.enviando.set(false);
      },
    });
  }
}
