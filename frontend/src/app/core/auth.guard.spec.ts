import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, UrlTree, provideRouter } from '@angular/router';
import { authGuard, visitanteGuard } from './auth.guard';
import { gravarToken, removerToken } from './token';

describe('authGuard', () => {
  beforeEach(() => {
    removerToken();
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
  });

  const executar = (url = '/') =>
    TestBed.runInInjectionContext(() =>
      authGuard(new ActivatedRouteSnapshot(), Object.assign(TestBed.inject(Router).routerState.snapshot, { url })),
    );

  it('redireciona para /login com a url pedida em returnUrl sem token', () => {
    const r = executar('/metas?x=1');
    expect(r).toBeInstanceOf(UrlTree);
    if (r instanceof UrlTree) expect(TestBed.inject(Router).serializeUrl(r)).toBe('/login?returnUrl=%2Fmetas%3Fx%3D1');
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
