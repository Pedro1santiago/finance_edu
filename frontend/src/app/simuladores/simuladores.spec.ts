import { TestBed } from '@angular/core/testing';
import { Simuladores } from './simuladores';

describe('Simuladores', () => {
  it.each(['Juros compostos', 'Investimento', 'Parcelamento', 'Economia mensal'])(
    'clicar em %s mostra o form certo',
    async (nome) => {
      await TestBed.configureTestingModule({ imports: [Simuladores] }).compileComponents();
      const fixture = TestBed.createComponent(Simuladores);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const botao = [...el.querySelectorAll('button')].find((b) => b.textContent?.trim() === nome)!;
      botao.click();
      await fixture.whenStable();
      fixture.detectChanges();
      const titulos = [...el.querySelectorAll('h2')].map((h) => h.textContent?.trim());
      expect(titulos).toEqual([nome]);
    },
  );

  it('abas usam role tab e aria-selected na aba ativa', async () => {
    await TestBed.configureTestingModule({ imports: [Simuladores] }).compileComponents();
    const fixture = TestBed.createComponent(Simuladores);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role=tablist]')).not.toBeNull();
    const abas = () => [...el.querySelectorAll<HTMLElement>('[role=tab]')];
    expect(abas().map((a) => a.getAttribute('aria-selected'))).toEqual(['true', 'false', 'false', 'false']);
    abas()[2].click();
    fixture.detectChanges();
    expect(abas().map((a) => a.getAttribute('aria-selected'))).toEqual(['false', 'false', 'true', 'false']);
  });
});
