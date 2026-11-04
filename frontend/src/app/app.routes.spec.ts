import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from './app.routes';
import { gravarToken, removerToken } from './core/token';

describe('rotas', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()] });
  });
  afterEach(() => removerToken());

  it('rota desconhecida logado mostra pagina nao encontrada com link para o dashboard', async () => {
    gravarToken('abc');
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/nada');
    const el: HTMLElement = harness.routeNativeElement!;
    expect(el.textContent).toContain('Página não encontrada');
    expect(el.querySelector('main a')!.getAttribute('href')).toBe('/dashboard');
  });
});
