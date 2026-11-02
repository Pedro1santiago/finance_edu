import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { NEVER } from 'rxjs';
import { routes } from './app.routes';
import { gravarToken, removerToken } from './core/token';
import { DashboardService } from './dashboard/dashboard.service';

describe('rotas', () => {
  afterEach(removerToken);

  it('/dashboard mostra a pagina do dashboard', async () => {
    gravarToken('tk');
    TestBed.configureTestingModule({
      providers: [provideRouter(routes), { provide: DashboardService, useValue: { obter: () => NEVER, evolucaoAportes: () => NEVER } }],
    });
    const harness = await RouterTestingHarness.create('/dashboard');
    expect(harness.routeNativeElement!.textContent).toContain('Carregando…');
  });
});
