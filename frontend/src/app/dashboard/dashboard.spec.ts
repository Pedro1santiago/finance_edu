import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of, throwError } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { Dashboard } from './dashboard';
import { Dashboard as Dados, DashboardService } from './dashboard.service';

vi.mock('chart.js/auto', () => ({ Chart: vi.fn(function () { return { destroy: vi.fn() }; }) }));

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
      providers: [provideRouter([]), { provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: DashboardService, useValue: service }, { provide: AuthService, useValue: { me: () => of({ id: 1, nome: 'Ana Souza', email: 'a@b.c', criadoEm: '' }) } }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Dashboard);
    await fixture.whenStable();
    return fixture;
  };

  const stat = (el: HTMLElement, nome: string) =>
    Array.from(el.querySelectorAll('.dash-stat')).find((s) => s.querySelector('.stat-caption')?.textContent?.trim() === nome)?.textContent ?? '';

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
      providers: [provideRouter([]), { provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: DashboardService, useValue: service }, { provide: AuthService, useValue: { me: () => of({ id: 1, nome: 'Ana Souza', email: 'a@b.c', criadoEm: '' }) } }],
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
    expect(stat(el, 'Total economizado')).toMatch(/R\$\s0,00/);
    expect(stat(el, 'Metas ativas')).toContain('0');
    expect(stat(el, 'Metas concluídas')).toContain('0');
    expect(stat(el, 'Metas ativas')).toContain('Progresso médio: 0%');
    expect(stat(el, 'Conteúdos concluídos')).toContain('0%');
    expect(el.textContent).toContain('Nenhum aporte nos últimos 12 meses');
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
    aportes.next([{ mes: '2026-03', total: 80 }]);
    aportes.complete();
    const el = await atualizar(fixture);
    expect(el.querySelector('canvas')).not.toBeNull();
    const texto = el.textContent!;
    expect(texto).not.toContain('Carregando…');
    expect(stat(el, 'Total economizado')).toMatch(/R\$\s1\.500,50/);
    expect(stat(el, 'Metas ativas')).toContain('2');
    expect(stat(el, 'Metas concluídas')).toContain('1');
    expect(stat(el, 'Metas ativas')).toContain('Progresso médio: 42,5%');
    expect(stat(el, 'Conteúdos concluídos')).toContain('50%');
    expect(texto).toContain('Orcamento');
    expect(texto).toContain('1 de 2');
    const barra = el.querySelector('.dashboard-goal-progress')!;
    expect(barra.getAttribute('aria-valuenow')).toBe('50');
    expect(barra.querySelector('i')!.style.width).toBe('50%');
    expect(texto).toContain('Juros compostos');
    expect(texto).toContain('05/03/2026');
  });
});
