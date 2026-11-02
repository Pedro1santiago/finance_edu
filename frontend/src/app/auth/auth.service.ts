import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { gravarToken, removerToken } from '../core/token';

interface Resposta {
  token: string;
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
