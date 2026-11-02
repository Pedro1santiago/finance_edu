import { HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Investimento } from './investimento';
import { SimulacaoService } from './simulacao.service';

registerLocaleData(localePt);
vi.mock('chart.js/auto', () => ({ Chart: vi.fn(function () { return { destroy: vi.fn() }; }) }));

describe('Investimento', () => {
  const investimento = vi.fn();

  const montar = async (valores: Record<string, string>, retorno?: unknown) => {
    investimento.mockReset();
    investimento.mockReturnValue(retorno);
    await TestBed.configureTestingModule({
      imports: [Investimento],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: SimulacaoService, useValue: { investimento } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Investimento);
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
    await fixture.whenStable();
    return el;
  };

  const valido = { valorInicial: '1000', aporteMensal: '100', taxaMensal: '1', meses: '12' };
  const evolucao = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, saldo: 1, totalInvestido: 1, juros: 0 }));

  it('valido mostra saldo, total investido, juros e o grafico', async () => {
    const el = await montar(valido, of({ saldoFinal: 2500.5, totalInvestido: 2200, totalJuros: 300.5, evolucao }));
    expect(investimento).toHaveBeenCalledWith({ valorInicial: 1000, aporteMensal: 100, taxaMensal: 1, meses: 12 });
    const texto = el.textContent!.replaceAll(' ', ' ');
    expect(texto).toContain('R$ 2.500,50');
    expect(texto).toContain('R$ 2.200,00');
    expect(texto).toContain('R$ 300,50');
    expect(el.querySelector('canvas')).not.toBeNull();
  });

  it('prazo 0 mostra validacao e nao chama o service', async () => {
    const el = await montar({ ...valido, meses: '0' });
    expect(investimento).not.toHaveBeenCalled();
    expect(el.querySelector('[role=alert]')).not.toBeNull();
  });

  it('erro apos sucesso nao deixa resultado nem grafico antigos', async () => {
    const el = await montar(valido, of({ saldoFinal: 2500.5, totalInvestido: 2200, totalJuros: 300.5, evolucao }));
    expect(el.querySelector('canvas')).not.toBeNull();
    investimento.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'Regra violada' } })));
    el.querySelector('form')!.dispatchEvent(new Event('submit'));
    await new Promise((r) => setTimeout(r));
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Regra violada');
    expect(el.querySelector('canvas')).toBeNull();
    expect(el.textContent).not.toContain('Saldo final');
  });

  it('erro mostra o detail e sem grafico', async () => {
    const el = await montar(valido, throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'Regra violada' } })));
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Regra violada');
    expect(el.querySelector('canvas')).toBeNull();
  });
});
