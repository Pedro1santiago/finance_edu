import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService, mensagemErro } from './auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Entrar</h1>
    <form [formGroup]="form" (ngSubmit)="enviar()">
      <label>Email <input name="email" type="email" formControlName="email" autocomplete="email" /></label>
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <p role="alert">Informe um email válido (até 180 caracteres).</p>
      }
      <label>Senha <input name="senha" type="password" formControlName="senha" autocomplete="current-password" /></label>
      @if (form.controls.senha.touched && form.controls.senha.invalid) {
        <p role="alert">A senha deve ter de 8 a 72 caracteres.</p>
      }
      @if (erro()) {
        <p role="alert">{{ erro() }}</p>
      }
      <button type="submit" [disabled]="enviando()">Entrar</button>
    </form>
    <p>Não tem conta? <a routerLink="/cadastro">Cadastre-se</a></p>
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
