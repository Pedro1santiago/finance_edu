import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, filter, map, of } from 'rxjs';
import { AuthService, Perfil } from '../../auth/auth.service';

const titulos: Record<string, string> = {
  dashboard: 'Dashboard',
  conteudos: 'Conteúdos',
  simuladores: 'Simuladores',
  metas: 'Metas',
};
const tituloDe = (url: string) => titulos[url.split(/[/?#]/)[1]] ?? 'FinanceEdu';

@Component({
  selector: 'app-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  template: `
    <div class="app-shell">
      <aside class="sidebar" [class.open]="menuAberto()">
        <div class="brand">
          <div class="brand-mark">F</div>
          <div class="brand-name">Finance<span>Edu</span></div>
        </div>
        <div class="side-label">MENU</div>
        <nav class="main-nav" aria-label="Principal">
          <a class="nav-link" routerLink="/dashboard" routerLinkActive="active" ariaCurrentWhenActive="page"><span class="nav-icon" aria-hidden="true">⌂</span><span>Dashboard</span></a>
          <a class="nav-link" routerLink="/conteudos" routerLinkActive="active" ariaCurrentWhenActive="page"><span class="nav-icon" aria-hidden="true">▤</span><span>Conteúdos</span></a>
          <a class="nav-link" routerLink="/simuladores" routerLinkActive="active" ariaCurrentWhenActive="page"><span class="nav-icon" aria-hidden="true">∿</span><span>Simuladores</span></a>
          <a class="nav-link" routerLink="/metas" routerLinkActive="active" ariaCurrentWhenActive="page"><span class="nav-icon" aria-hidden="true">◎</span><span>Metas</span></a>
        </nav>
        <div class="sidebar-bottom">
          <div class="profile-row">
            <div class="avatar" aria-hidden="true">{{ perfil()?.nome?.charAt(0)?.toUpperCase() }}</div>
            <div>
              <strong>{{ perfil()?.nome }}</strong>
              <span>{{ perfil()?.email }}</span>
            </div>
          </div>
          <button type="button" class="button button-quiet" (click)="auth.sair()">Sair</button>
        </div>
      </aside>
      <div class="main-area">
        <header class="topbar">
          <button type="button" class="mobile-menu" aria-label="Abrir menu" [attr.aria-expanded]="menuAberto()" (click)="menuAberto.set(!menuAberto())">☰</button>
          <div class="breadcrumb"><span>FinanceEdu</span><span class="crumb-divider">/</span><strong>{{ titulo() }}</strong></div>
          <div class="topbar-right"><span class="today-label">{{ hoje }}</span></div>
        </header>
        <main class="page-content"><router-outlet /></main>
      </div>
    </div>
  `,
  styles: `
    .sidebar-bottom .button { width: 100%; margin-top: 12px; }
  `,
})
export class Layout {
  auth = inject(AuthService);
  private router = inject(Router);
  menuAberto = signal(false);
  hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
  titulo = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map((e) => tituloDe(e.urlAfterRedirects)),
    ),
    { initialValue: tituloDe(this.router.url) },
  );
  perfil = toSignal<Perfil | null>(this.auth.me().pipe(catchError(() => of(null))), { initialValue: null });

  constructor() {
    this.router.events.pipe(filter((e) => e instanceof NavigationEnd), takeUntilDestroyed()).subscribe(() => this.menuAberto.set(false));
  }
}
