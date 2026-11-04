import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService, mensagemErro } from './auth.service';

@Component({
  selector: 'app-cadastro',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <h1>Criar conta</h1>
    <form [formGroup]="form" (ngSubmit)="enviar()">
      <label>Nome <input name="nome" formControlName="nome" autocomplete="name" /></label>
      @if (form.controls.nome.touched && form.controls.nome.invalid) {
        <p role="alert">Informe o nome (até 120 caracteres).</p>
      }
      <label>Email <input name="email" type="email" formControlName="email" autocomplete="email" /></label>
      @if (form.controls.email.touched && form.controls.email.invalid) {
        <p role="alert">Informe um email válido (até 180 caracteres).</p>
      }
      <label>Senha <input name="senha" type="password" formControlName="senha" autocomplete="new-password" /></label>
      @if (form.controls.senha.touched && form.controls.senha.invalid) {
        <p role="alert">A senha deve ter de 8 a 72 caracteres.</p>
      }
      @if (erro()) {
        <p role="alert">{{ erro() }}</p>
      }
      <button type="submit" [disabled]="enviando()">Cadastrar</button>
    </form>
    <p>Já tem conta? <a routerLink="/login">Entrar</a></p>
  `,
})
export class Cadastro {
  private auth = inject(AuthService);
  private router = inject(Router);
  erro = signal('');
  enviando = signal(false);
  form = inject(FormBuilder).nonNullable.group({
    nome: ['', [Validators.required, Validators.pattern(/\S/), Validators.maxLength(120)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(180)]],
    senha: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(72)]],
  });

  enviar() {
    if (this.form.invalid) return this.form.markAllAsTouched();
    if (this.enviando()) return;
    this.enviando.set(true);
    this.auth.registrar(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (e) => {
        this.erro.set(mensagemErro(e));
        this.enviando.set(false);
      },
    });
  }
}
