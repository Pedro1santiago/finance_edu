import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Layout } from './layout';

describe('Layout', () => {
  it('renderiza os 4 links e o router-outlet', async () => {
    await TestBed.configureTestingModule({ imports: [Layout], providers: [provideRouter([])] }).compileComponents();
    const fixture = TestBed.createComponent(Layout);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const links = Array.from(el.querySelectorAll('nav a')).map((a) => a.textContent?.trim());
    expect(links).toEqual(['Dashboard', 'Conteúdos', 'Simuladores', 'Metas']);
    expect(el.querySelector('router-outlet')).toBeTruthy();
  });
});
