import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { gravarToken, removerToken } from '../core/token';

export const mensagemErro = (e: unknown) =>
  (e instanceof HttpErrorResponse && e.error?.detail) ||
  (e instanceof HttpErrorResponse && e.status !== 0 ? 'Erro no servidor, tente novamente' : 'Não foi possível conectar');

interface Resposta {
  token: string;
}

export interface Perfil {
  id: number;
  nome: string;
  email: string;
  criadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  login(dados: { email: string; senha: string }) {
    return this.enviar('login', dados);
  }

  registrar(dados: { nome: string; email: string; senha: string }) {
    return this.enviar('register', dados);
  }

  me() {
    return this.http.get<Perfil>(`${environment.apiUrl}/api/me`);
  }

  sair() {
    removerToken();
    this.router.navigateByUrl('/login');
  }

  private enviar(caminho: string, dados: object) {
    return this.http
      .post<Resposta>(`${environment.apiUrl}/api/auth/${caminho}`, dados)
      .pipe(tap((r) => gravarToken(r.token)));
  }
}
