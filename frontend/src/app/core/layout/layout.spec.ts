import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { AuthService } from '../../auth/auth.service';
import { Layout } from './layout';

@Component({ template: '' })
class Vazio {}

describe('Layout', () => {
  it('renderiza os 4 links e o router-outlet', async () => {
    await TestBed.configureTestingModule({ imports: [Layout], providers: [provideRouter([{ path: '**', component: Vazio }])] }).compileComponents();
    const fixture = TestBed.createComponent(Layout);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('nav a')).map((a) => a.textContent?.trim());
    expect(links).toEqual(['Dashboard', 'Conteúdos', 'Simuladores', 'Metas']);
    expect(el.querySelector('router-outlet')).toBeTruthy();
    await TestBed.inject(Router).navigateByUrl('/metas');
    fixture.detectChanges();
    const ativo = el.querySelector('nav a[aria-current="page"]');
    expect(ativo?.textContent?.trim()).toBe('Metas');
  });

  it('botao Sair chama AuthService.sair', async () => {
    const sair = vi.fn();
    await TestBed.configureTestingModule({
      imports: [Layout],
      providers: [provideRouter([]), { provide: AuthService, useValue: { sair } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Layout);
    await fixture.whenStable();
    const botao = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Sair');
    botao!.click();
    expect(sair).toHaveBeenCalled();
  });
});
