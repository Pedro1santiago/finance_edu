import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, provideRouter } from '@angular/router';
import { authGuard, visitanteGuard } from './auth.guard';
import { gravarToken, removerToken } from './token';

describe('authGuard', () => {
  beforeEach(() => {
    removerToken();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  const executar = () =>
    TestBed.runInInjectionContext(() =>
      authGuard(new ActivatedRouteSnapshot(), TestBed.inject(Router).routerState.snapshot),
    );

  it('redireciona para /login sem token', () => {
    const r = executar();
    expect(r).toBeInstanceOf(UrlTree);
    if (r instanceof UrlTree) expect(TestBed.inject(Router).serializeUrl(r)).toBe('/login');
  });

  it('libera com token', () => {
    gravarToken('abc');
    expect(executar()).toBe(true);
  });
});

describe('visitanteGuard', () => {
  beforeEach(() => {
    removerToken();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  const executar = () =>
    TestBed.runInInjectionContext(() =>
      visitanteGuard(new ActivatedRouteSnapshot(), TestBed.inject(Router).routerState.snapshot),
    );

  it('libera sem token', () => {
    expect(executar()).toBe(true);
  });

  it('redireciona para /dashboard com token', () => {
    gravarToken('abc');
    const r = executar();
    expect(r).toBeInstanceOf(UrlTree);
    if (r instanceof UrlTree) expect(TestBed.inject(Router).serializeUrl(r)).toBe('/dashboard');
  });
});
