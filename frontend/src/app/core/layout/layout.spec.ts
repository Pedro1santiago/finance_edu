import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { of } from 'rxjs';
import { AuthService } from '../../auth/auth.service';
import { Layout } from './layout';

@Component({ template: '' })
class Vazio {}

const perfil = { id: 1, nome: 'Ana Souza', email: 'ana@exemplo.com', criadoEm: '2026-01-01T00:00:00Z' };

async function montar(auth?: object) {
  await TestBed.configureTestingModule({
    imports: [Layout],
    providers: [
      provideRouter([{ path: '**', component: Vazio }]),
      provideHttpClient(),
      provideHttpClientTesting(),
      ...(auth ? [{ provide: AuthService, useValue: auth }] : []),
    ],
  }).compileComponents();
  const fixture = TestBed.createComponent(Layout);
  await fixture.whenStable();
  return { fixture, el: fixture.nativeElement as HTMLElement };
}

describe('Layout', () => {
  it('renderiza os 4 links e o router-outlet', async () => {
    const { fixture, el } = await montar();
    const links = Array.from(el.querySelectorAll('nav a > span:last-child')).map((a) => a.textContent?.trim());
    expect(links).toEqual(['Dashboard', 'Conteúdos', 'Simuladores', 'Metas']);
    expect(el.querySelector('router-outlet')).toBeTruthy();
    await TestBed.inject(Router).navigateByUrl('/metas');
    fixture.detectChanges();
    const ativo = el.querySelector('nav a[aria-current="page"]');
    expect(ativo?.querySelector('span:last-child')?.textContent?.trim()).toBe('Metas');
    expect(el.querySelector('.breadcrumb strong')?.textContent?.trim()).toBe('Metas');
  });

  it('botao Sair chama AuthService.sair', async () => {
    const sair = vi.fn();
    const { el } = await montar({ sair, me: () => of(perfil) });
    const botao = Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Sair');
    botao!.click();
    expect(sair).toHaveBeenCalled();
  });

  it('mostra nome e email do usuario vindos de /api/me', async () => {
    const { fixture, el } = await montar();
    TestBed.inject(HttpTestingController).expectOne((r) => r.url.endsWith('/api/me')).flush(perfil);
    fixture.detectChanges();
    const linha = el.querySelector('.profile-row');
    expect(linha?.textContent).toContain('Ana Souza');
    expect(linha?.textContent).toContain('ana@exemplo.com');
  });

  it('botao do menu mobile abre e fecha a sidebar', async () => {
    const { fixture, el } = await montar();
    const botao = el.querySelector<HTMLButtonElement>('.mobile-menu')!;
    const sidebar = el.querySelector('.sidebar')!;
    expect(botao.getAttribute('aria-label')).toBeTruthy();
    expect(botao.getAttribute('aria-expanded')).toBe('false');
    expect(sidebar.classList.contains('open')).toBe(false);
    botao.click();
    fixture.detectChanges();
    expect(botao.getAttribute('aria-expanded')).toBe('true');
    expect(sidebar.classList.contains('open')).toBe(true);
    botao.click();
    fixture.detectChanges();
    expect(sidebar.classList.contains('open')).toBe(false);
  });

  it('fecha a sidebar ao navegar por um link', async () => {
    const { fixture, el } = await montar();
    el.querySelector<HTMLButtonElement>('.mobile-menu')!.click();
    fixture.detectChanges();
    el.querySelector<HTMLAnchorElement>('nav a')!.click();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('.sidebar')!.classList.contains('open')).toBe(false);
  });
});
