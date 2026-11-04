import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header>
      <strong>FinanceEdu</strong>
      <nav>
        <a routerLink="/dashboard" routerLinkActive="ativo" ariaCurrentWhenActive="page">Dashboard</a>
        <a routerLink="/conteudos" routerLinkActive="ativo" ariaCurrentWhenActive="page">Conteúdos</a>
        <a routerLink="/simuladores" routerLinkActive="ativo" ariaCurrentWhenActive="page">Simuladores</a>
        <a routerLink="/metas" routerLinkActive="ativo" ariaCurrentWhenActive="page">Metas</a>
      </nav>
      <button type="button" (click)="auth.sair()">Sair</button>
    </header>
    <main><router-outlet /></main>
  `,
  styles: `
    header { display: flex; flex-wrap: wrap; gap: 0.5rem 2rem; align-items: center; padding: 1rem; border-bottom: 1px solid var(--borda); }
    header, header * { overflow-wrap: normal; }
    nav { display: flex; flex-wrap: wrap; gap: 0.5rem 1rem; }
    button { margin-left: auto; }
    .ativo { font-weight: bold; }
    main { padding: 1rem; }
  `,
})
export class Layout {
  auth = inject(AuthService);
}
