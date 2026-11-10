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

  describe('acessibilidade das abas', () => {
    const montar = async () => {
      await TestBed.configureTestingModule({ imports: [Simuladores] }).compileComponents();
      const fixture = TestBed.createComponent(Simuladores);
      await fixture.whenStable();
      const el = fixture.nativeElement as HTMLElement;
      const abas = () => [...el.querySelectorAll<HTMLElement>('[role=tab]')];
      const tecla = (aba: HTMLElement, key: string) => {
        aba.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
        fixture.detectChanges();
      };
      return { el, abas, tecla };
    };

    it('abas e painel se referenciam por id, aria-controls e aria-labelledby', async () => {
      const { el, abas } = await montar();
      const painel = el.querySelector('[role=tabpanel]')!;
      expect(painel.id).toBeTruthy();
      abas().forEach((a) => {
        expect(a.id).toBeTruthy();
        expect(a.getAttribute('aria-controls')).toBe(painel.id);
      });
      expect(painel.getAttribute('aria-labelledby')).toBe(abas()[0].id);
    });

    it('apenas a aba ativa entra na ordem de tab', async () => {
      const { abas } = await montar();
      expect(abas().map((a) => a.getAttribute('tabindex'))).toEqual(['0', '-1', '-1', '-1']);
    });

    it('setas movem a selecao e o foco, com volta nas pontas', async () => {
      const { el, abas, tecla } = await montar();
      tecla(abas()[0], 'ArrowRight');
      expect(abas()[1].getAttribute('aria-selected')).toBe('true');
      expect(document.activeElement).toBe(abas()[1]);
      expect(el.querySelector('[role=tabpanel]')!.getAttribute('aria-labelledby')).toBe(abas()[1].id);
      tecla(abas()[1], 'ArrowLeft');
      tecla(abas()[0], 'ArrowLeft');
      expect(abas()[3].getAttribute('aria-selected')).toBe('true');
      expect(document.activeElement).toBe(abas()[3]);
      tecla(abas()[3], 'ArrowRight');
      expect(abas()[0].getAttribute('aria-selected')).toBe('true');
    });
  });
});
