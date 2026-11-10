import { HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Economia } from './economia';
import { SimulacaoService } from './simulacao.service';

registerLocaleData(localePt);

describe('Economia', () => {
  const economia = vi.fn();

  const montar = async (valores: Record<string, string>, retorno?: unknown) => {
    economia.mockReset();
    economia.mockReturnValue(retorno);
    await TestBed.configureTestingModule({
      imports: [Economia],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: SimulacaoService, useValue: { economia } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Economia);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    for (const [nome, valor] of Object.entries(valores)) {
      const i = el.querySelector<HTMLInputElement>(`input[name=${nome}]`)!;
      i.value = valor;
      i.dispatchEvent(new Event('input'));
    }
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    fixture.detectChanges();
    return el;
  };

  const valido = { objetivo: '1000', economiaMensal: '100' };

  it('valido mostra meses e economia anual', async () => {
    const el = await montar(valido, of({ mesesNecessarios: 10, economiaAnual: 1200 }));
    expect(economia).toHaveBeenCalledWith({ objetivo: 1000, economiaMensal: 100 });
    const texto = el.textContent!.replaceAll(' ', ' ');
    expect(texto).toContain('10 meses');
    expect(texto).toContain('R$ 1.200,00');
  });

  it('1 mes no singular', async () => {
    const el = await montar({ objetivo: '100', economiaMensal: '100' }, of({ mesesNecessarios: 1, economiaAnual: 1200 }));
    expect(el.querySelector('.result-eyebrow')!.textContent).toBe('MESES NECESSÁRIOS');
    expect(el.querySelector('.result-amount')!.textContent!.trim()).toBe('1 mês');
    expect(el.textContent).not.toContain('1 meses');
  });

  it('economia mensal 0 mostra validacao e nao chama o service', async () => {
    const el = await montar({ ...valido, economiaMensal: '0' });
    expect(economia).not.toHaveBeenCalled();
    expect(el.querySelector('[role=alert]')).not.toBeNull();
  });

  it('erro mostra o detail', async () => {
    const el = await montar(valido, throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'Regra violada' } })));
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Regra violada');
    expect(el.querySelector('button')!.disabled).toBe(false);
  });
});
