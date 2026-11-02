import { HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
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

  const abrir = async () => {
    await TestBed.configureTestingModule({
      imports: [MetaDetalhe],
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'pt-BR' },
        { provide: MetaService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id: '7' }) } } },
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
    expect(el.querySelector('progress')!.value).toBe(20);
    expect(el.querySelectorAll('li').length).toBe(1);
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
