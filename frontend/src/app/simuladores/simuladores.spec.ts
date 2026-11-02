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
});
