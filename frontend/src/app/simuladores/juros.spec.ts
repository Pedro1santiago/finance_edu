import { HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Subject, of, throwError } from 'rxjs';
import { Juros } from './juros';
import { SimulacaoService } from './simulacao.service';

registerLocaleData(localePt);

describe('Juros', () => {
  const jurosCompostos = vi.fn();

  const montar = async () => {
    jurosCompostos.mockReset();
    await TestBed.configureTestingModule({
      imports: [Juros],
      providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: SimulacaoService, useValue: { jurosCompostos } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Juros);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const preencher = (nome: string, valor: string) => {
      const i = el.querySelector<HTMLInputElement>(`input[name=${nome}]`)!;
      i.value = valor;
      i.dispatchEvent(new Event('input'));
    };
    const enviar = async () => {
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
      fixture.detectChanges();
    };
    const valido = () => {
      preencher('capital', '1000');
      preencher('taxaMensal', '1');
      preencher('meses', '12');
    };
    return { el, fixture, preencher, enviar, valido };
  };

  it('form valido chama o service e mostra o resultado em reais', async () => {
    const { el, enviar, valido } = await montar();
    jurosCompostos.mockReturnValue(of({ capital: 1000, taxaMensal: 1, meses: 12, montante: 1126.83, juros: 126.83 }));
    valido();
    await enviar();
    expect(jurosCompostos).toHaveBeenCalledWith({ capital: 1000, taxaMensal: 1, meses: 12 });
    const texto = el.textContent!.replaceAll(' ', ' ');
    expect(texto).toContain('R$ 1.126,83');
    expect(texto).toContain('R$ 126,83');
  });

  it.each(['0', '', '1201', '1.5'])('prazo %j mostra validacao e nao chama o service', async (meses) => {
    const { el, preencher, enviar, valido } = await montar();
    valido();
    preencher('meses', meses);
    await enviar();
    expect(jurosCompostos).not.toHaveBeenCalled();
    expect(el.querySelector('[role=alert]')).not.toBeNull();
  });

  it('mensagens de validacao mantem as unidades', async () => {
    const { el, preencher, enviar, valido } = await montar();
    valido();
    preencher('taxaMensal', '-1');
    preencher('meses', '0');
    await enviar();
    const msgs = [...el.querySelectorAll('[role=alert]')].map((a) => a.textContent?.trim());
    expect(msgs).toEqual(['Taxa mensal (%) inválido.', 'Prazo (meses) inválido.']);
  });

  it('duplo submit faz uma requisicao e desabilita o botao ate a resposta', async () => {
    const { el, fixture, enviar, valido } = await montar();
    const resposta = new Subject();
    jurosCompostos.mockReturnValue(resposta);
    valido();
    await enviar();
    await enviar();
    expect(jurosCompostos).toHaveBeenCalledTimes(1);
    expect(el.querySelector('button')!.disabled).toBe(true);
    resposta.next({ montante: 1, juros: 0 });
    resposta.complete();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(el.querySelector('button')!.disabled).toBe(false);
  });

  it('erro mostra o detail e o form segue editavel', async () => {
    const { el, enviar, valido } = await montar();
    jurosCompostos.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'Regra violada' } })));
    valido();
    await enviar();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Regra violada');
    expect(el.querySelector('button')!.disabled).toBe(false);
  });
});
