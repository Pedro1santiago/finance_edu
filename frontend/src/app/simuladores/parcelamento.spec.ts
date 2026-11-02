import { HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { Parcelamento } from './parcelamento';
import { SimulacaoService } from './simulacao.service';

registerLocaleData(localePt);

describe('Parcelamento', () => {
  const parcelamento = vi.fn();

  const montar = async (valores: Record<string, string>) => {
    parcelamento.mockReset();
    await TestBed.configureTestingModule({
      imports: [Parcelamento],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: SimulacaoService, useValue: { parcelamento } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Parcelamento);
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

  const valido = { valor: '1000', taxaMensal: '0', parcelas: '10' };

  it('valido mostra parcela e juros em reais', async () => {
    parcelamento.mockReturnValue(of({ valorParcela: 100, totalPago: 1000, totalJuros: 0 }));
    const el = await montar(valido);
    expect(parcelamento).toHaveBeenCalledWith({ valor: 1000, taxaMensal: 0, parcelas: 10 });
    const texto = el.textContent!.replaceAll(' ', ' ');
    expect(texto).toContain('R$ 100,00');
    expect(texto).toContain('R$ 0,00');
  });

  it('parcelas 0 mostra validacao e nao chama o service', async () => {
    const el = await montar({ ...valido, parcelas: '0' });
    expect(parcelamento).not.toHaveBeenCalled();
    expect(el.querySelector('[role=alert]')).not.toBeNull();
  });

  it('erro mostra o detail', async () => {
    parcelamento.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'Regra violada' } })));
    const el = await montar(valido);
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Regra violada');
    expect(el.querySelector('button')!.disabled).toBe(false);
  });
});
