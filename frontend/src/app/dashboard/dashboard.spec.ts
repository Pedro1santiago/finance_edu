import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { Dashboard } from './dashboard';
import { Dashboard as Dados, DashboardService } from './dashboard.service';

registerLocaleData(localePt);

const dados: Dados = {
  totalEconomizado: 1500.5,
  metasAtivas: 2,
  metasConcluidas: 1,
  percentualMedioMetas: 42.5,
  percentualConteudos: 50,
  progressoConteudos: [{ moduloId: 1, titulo: 'Orcamento', total: 2, concluidos: 1, percentual: 50 }],
  ultimasSimulacoes: [{ id: 1, tipo: 'JUROS_COMPOSTOS', criadaEm: '2026-03-05T10:00:00Z' }],
};

describe('Dashboard', () => {
  const service = { obter: vi.fn(), evolucaoAportes: vi.fn() };
  let resumo: Subject<Dados>;
  let aportes: Subject<{ mes: string; total: number }[]>;

  beforeEach(() => {
    resumo = new Subject();
    aportes = new Subject();
  });

  const abrir = async () => {
    service.obter.mockReturnValue(resumo);
    service.evolucaoAportes.mockReturnValue(aportes);
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), { provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: DashboardService, useValue: service }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    return fixture;
  };

  const atualizar = async (fixture: Awaited<ReturnType<typeof abrir>>) => {
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  it.each([
    [500, 'Erro no servidor, tente novamente'],
    [0, 'Não foi possível conectar'],
  ])('erro de carga (status %i) mostra alerta; tentar novamente limpa e recarrega', async (status, mensagem) => {
    service.obter.mockReset();
    service.evolucaoAportes.mockReset();
    service.obter.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status })));
    service.evolucaoAportes.mockReturnValueOnce(of([]));
    service.obter.mockReturnValueOnce(of(dados));
    service.evolucaoAportes.mockReturnValueOnce(of([]));
    await TestBed.configureTestingModule({
      imports: [Dashboard],
      providers: [provideRouter([]), { provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: DashboardService, useValue: service }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Dashboard);
    const el = await atualizar(fixture);
    expect(el.querySelector('[role=alert]')!.textContent).toContain(mensagem);
    expect(el.textContent).not.toContain('Carregando…');
    expect(el.textContent).not.toContain('Total economizado');

    el.querySelector('button')!.click();
    const depois = await atualizar(fixture);
    expect(depois.querySelector('[role=alert]')).toBeNull();
    expect(depois.textContent).toContain('Total economizado');
  });

  it('usuario novo ve zeros, estado vazio de simulacoes e link para metas', async () => {
    const fixture = await abrir();
    resumo.next({ ...dados, totalEconomizado: 0, metasAtivas: 0, metasConcluidas: 0, percentualMedioMetas: 0, percentualConteudos: 0, progressoConteudos: [], ultimasSimulacoes: [] });
    resumo.complete();
    aportes.next([]);
    aportes.complete();
    const el = await atualizar(fixture);
    expect(el.textContent).toMatch(/R\$\s0,00/);
    expect(el.textContent).toContain('Nenhuma simulação ainda');
    expect(el.querySelector('a[href="/simuladores"]')).not.toBeNull();
    expect(el.querySelector('a[href="/metas"]')).not.toBeNull();
  });

  it('mostra Carregando e nenhum indicador antes da resposta, depois os valores', async () => {
    const fixture = await abrir();
    const antes = await atualizar(fixture);
    expect(antes.textContent).toContain('Carregando…');
    expect(antes.textContent).not.toContain('R$');
    expect(service.evolucaoAportes).toHaveBeenCalledWith(12);

    resumo.next(dados);
    resumo.complete();
    aportes.next([]);
    aportes.complete();
    const el = await atualizar(fixture);
    const texto = el.textContent!;
    expect(texto).not.toContain('Carregando…');
    expect(texto).toMatch(/R\$\s1\.500,50/);
    expect(texto).toContain('2');
    expect(texto).toContain('42,5%');
    expect(texto).toContain('50%');
    expect(texto).toContain('Orcamento');
    expect(texto).toContain('1 de 2');
    expect(el.querySelector('progress')!.value).toBe(50);
    expect(texto).toContain('Juros compostos');
    expect(texto).toContain('05/03/2026');
  });
});
