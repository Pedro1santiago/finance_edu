import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <header>
      <strong>FinanceEdu</strong>
      <nav>
        <a routerLink="/dashboard" routerLinkActive="ativo">Dashboard</a>
        <a routerLink="/conteudos" routerLinkActive="ativo">Conteúdos</a>
        <a routerLink="/simuladores" routerLinkActive="ativo">Simuladores</a>
        <a routerLink="/metas" routerLinkActive="ativo">Metas</a>
      </nav>
    </header>
    <main><router-outlet /></main>
  `,
  styles: `
    header { display: flex; gap: 2rem; align-items: center; padding: 1rem; border-bottom: 1px solid #ddd; }
    nav { display: flex; gap: 1rem; }
    .ativo { font-weight: bold; }
    main { padding: 1rem; }
  `,
})
export class Layout {}
