import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

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
    </header>
    <main><router-outlet /></main>
  `,
  styles: `
    header { display: flex; gap: 2rem; align-items: center; padding: 1rem; border-bottom: 1px solid var(--borda); }
    nav { display: flex; gap: 1rem; }
    .ativo { font-weight: bold; }
    main { padding: 1rem; }
  `,
})
export class Layout {}
