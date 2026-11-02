import { TestBed } from '@angular/core/testing';
import { Router, UrlTree, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';
import { gravarToken, removerToken } from './token';

describe('authGuard', () => {
  beforeEach(() => {
    removerToken();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  const executar = () => TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

  it('redireciona para /login sem token', () => {
    const r = executar() as UrlTree;
    expect(TestBed.inject(Router).serializeUrl(r)).toBe('/login');
  });

  it('libera com token', () => {
    gravarToken('abc');
    expect(executar()).toBe(true);
  });
});
