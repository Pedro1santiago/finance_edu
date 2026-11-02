import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { Meta, MetaService } from './meta.service';
import { Metas } from './metas';

registerLocaleData(localePt);

const meta = (extra: Partial<Meta> = {}): Meta => ({
  id: 1,
  nome: 'Viagem',
  valorAlvo: 5000,
  prazo: '2030-01-01',
  criadaEm: '2026-11-02',
  totalEconomizado: 1000,
  valorRestante: 4000,
  percentualAtingido: 20,
  status: 'ATIVA',
  estimativaConclusao: null,
  ...extra,
});

describe('Metas', () => {
  const service = { listar: vi.fn(), criar: vi.fn(), alterar: vi.fn(), excluir: vi.fn() };

  const montar = async (lista: Meta[]) => {
    Object.values(service).forEach((f) => f.mockReset());
    service.listar.mockReturnValue(of(lista));
    await TestBed.configureTestingModule({
      imports: [Metas],
      providers: [provideRouter([]), { provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: MetaService, useValue: service }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Metas);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const atualizar = async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
    };
    await atualizar();
    return { el, atualizar };
  };

  it('lista metas com nome, percentual, status e valores', async () => {
    const { el } = await montar([meta()]);
    const texto = el.textContent!.replaceAll(' ', ' ');
    expect(texto).toContain('Viagem');
    expect(texto).toContain('20%');
    expect(texto).toContain('ATIVA');
    expect(texto).toContain('R$ 1.000,00');
    expect(texto).toContain('R$ 5.000,00');
    expect(el.querySelector('progress')!.value).toBe(20);
  });

  it('sem metas mostra estado vazio', async () => {
    const { el } = await montar([]);
    expect(el.textContent).toContain('Nenhuma meta');
  });
});
