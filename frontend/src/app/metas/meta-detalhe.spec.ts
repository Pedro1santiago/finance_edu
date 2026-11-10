import { HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { Aporte, Meta, MetaService } from './meta.service';
import { MetaDetalhe } from './meta-detalhe';

registerLocaleData(localePt);

const meta = (extra: Partial<Meta> = {}): Meta => ({
  id: 7,
  nome: 'Viagem',
  valorAlvo: 5000,
  prazo: '2030-01-01',
  criadaEm: '2026-11-02',
  totalEconomizado: 1000,
  valorRestante: 4000,
  percentualAtingido: 20,
  status: 'ATIVA',
  estimativaConclusao: '2027-05-10',
  ...extra,
});
const aporte: Aporte = { id: 1, valor: 1000, data: '2026-11-02' };

describe('MetaDetalhe', () => {
  const service = { buscar: vi.fn(), aportes: vi.fn(), registrarAporte: vi.fn() };

  const montar = async () => {
    Object.values(service).forEach((f) => f.mockReset());
    service.buscar.mockReturnValue(of(meta()));
    service.aportes.mockReturnValue(of([aporte]));
    return abrir();
  };

  const abrir = async (id = '7') => {
    await TestBed.configureTestingModule({
      imports: [MetaDetalhe],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: MetaService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(MetaDetalhe);
    const el = fixture.nativeElement as HTMLElement;
    const atualizar = async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
    };
    await atualizar();
    return { el, atualizar };
  };

  it('mostra progresso, valores, estimativa e aportes', async () => {
    const { el } = await montar();
    expect(service.buscar).toHaveBeenCalledWith(7);
    expect(service.aportes).toHaveBeenCalledWith(7);
    const texto = el.textContent!.replaceAll(' ', ' ');
    expect(texto).toContain('Viagem');
    expect(texto).toContain('20%');
    expect(texto).toContain('ATIVA');
    expect(texto).toContain('R$ 4.000,00');
    expect(texto).toContain('R$ 1.000,00');
    expect(texto).toContain('10/05/2027');
    const barra = el.querySelector('.goal-progress')!;
    expect(barra.getAttribute('aria-valuenow')).toBe('20');
    expect(barra.querySelector('i')!.style.width).toBe('20%');
    expect(el.querySelectorAll('li').length).toBe(1);
  });

  describe('aporte', () => {
    const enviar = async (valor: string, retorno?: unknown) => {
      const { el, atualizar } = await montar();
      service.registrarAporte.mockReturnValue(retorno);
      const i = el.querySelector<HTMLInputElement>('input[name=valor]')!;
      i.value = valor;
      i.dispatchEvent(new Event('input'));
      const submeter = async () => {
        el.querySelector('form')!.dispatchEvent(new Event('submit'));
        await atualizar();
      };
      await submeter();
      return { el, submeter };
    };

    it('valido registra com data de hoje e recarrega meta e aportes', async () => {
      await enviar('1000', of(aporte));
      expect(service.registrarAporte).toHaveBeenCalledWith(7, { valor: 1000, data: new Date().toLocaleDateString('sv') });
      expect(service.buscar).toHaveBeenCalledTimes(2);
      expect(service.aportes).toHaveBeenCalledTimes(2);
    });

    it('aporte valido apos invalido remove a mensagem de validacao', async () => {
      const { el, atualizar } = await montar();
      service.registrarAporte.mockReturnValue(of(aporte));
      const enviarValor = async (valor: string) => {
        const i = el.querySelector<HTMLInputElement>('input[name=valor]')!;
        i.value = valor;
        i.dispatchEvent(new Event('input'));
        el.querySelector('form')!.dispatchEvent(new Event('submit'));
        await atualizar();
      };
      await enviarValor('0');
      expect(el.textContent).toContain('Informe um valor');
      await enviarValor('100');
      expect(service.registrarAporte).toHaveBeenCalledTimes(1);
      expect(el.textContent).not.toContain('Informe um valor');
    });

    it('valor zero nao chama', async () => {
      await enviar('0');
      expect(service.registrarAporte).not.toHaveBeenCalled();
    });

    it('desabilita o botao em voo e envia uma vez so', async () => {
      const { el, submeter } = await enviar('1000', new Subject());
      await submeter();
      expect(service.registrarAporte).toHaveBeenCalledTimes(1);
      expect(el.querySelector<HTMLButtonElement>('form button[type=submit]')!.disabled).toBe(true);
    });
  });

  it('percentual usa formato pt-BR', async () => {
    Object.values(service).forEach((f) => f.mockReset());
    service.buscar.mockReturnValue(of(meta({ percentualAtingido: 46.25 })));
    service.aportes.mockReturnValue(of([]));
    const { el } = await abrir();
    expect(el.textContent).toContain('46,25%');
  });

  it.each(['abc', '0', '-1', '1.5'])('id invalido (%s) mostra Meta nao encontrada sem requisicao', async (id) => {
    Object.values(service).forEach((f) => f.mockReset());
    const { el } = await abrir(id);
    expect(el.textContent).toContain('Meta não encontrada');
    expect(service.buscar).not.toHaveBeenCalled();
    expect(service.aportes).not.toHaveBeenCalled();
  });

  it('recarga bem-sucedida limpa o erro anterior', async () => {
    const { el, atualizar } = await montar();
    service.buscar.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 500 })));
    service.registrarAporte.mockReturnValue(of(aporte));
    const enviar = async (valor: string) => {
      const i = el.querySelector<HTMLInputElement>('input[name=valor]')!;
      i.value = valor;
      i.dispatchEvent(new Event('input'));
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await atualizar();
    };
    await enviar('10');
    expect(el.textContent).toContain('Erro no servidor, tente novamente');
    await enviar('20');
    expect(el.textContent).not.toContain('Erro no servidor, tente novamente');
  });

  it('404 mostra Meta nao encontrada com link para /metas', async () => {
    Object.values(service).forEach((f) => f.mockReset());
    service.buscar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    service.aportes.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const { el } = await abrir();
    expect(el.textContent).toContain('Meta não encontrada');
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/metas');
  });
});
