import { TestBed } from '@angular/core/testing';
import { Chart } from 'chart.js/auto';
import { AporteMes } from './dashboard.service';
import { GraficoAportes } from './grafico-aportes';

vi.mock('chart.js/auto', () => ({ Chart: vi.fn(function () { return { destroy: vi.fn() }; }) }));

describe('GraficoAportes', () => {
  const aportes: AporteMes[] = [
    { mes: '2026-01', total: 0 },
    { mes: '2026-02', total: 150 },
    { mes: '2026-03', total: 20 },
  ];

  const montar = async (valores: AporteMes[]) => {
    const fixture = TestBed.createComponent(GraficoAportes);
    fixture.componentRef.setInput('aportes', valores);
    await fixture.whenStable();
    return fixture;
  };

  it('cria bar chart com labels pt-BR e totais', async () => {
    const fixture = await montar(aportes);
    expect(fixture.nativeElement.querySelector('canvas')).not.toBeNull();
    expect(Chart).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({
        type: 'bar',
        data: { labels: ['jan/26', 'fev/26', 'mar/26'], datasets: [{ label: 'Aportes', data: [0, 150, 20], backgroundColor: expect.any(String) }] },
        options: expect.objectContaining({ maintainAspectRatio: false }),
      }),
    );
  });

  it('tudo zerado mostra texto sem canvas nem grafico', async () => {
    vi.mocked(Chart).mockClear();
    const fixture = await montar(aportes.map((a) => ({ ...a, total: 0 })));
    expect(fixture.nativeElement.querySelector('canvas')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('Nenhum aporte nos últimos 12 meses');
    expect(Chart).not.toHaveBeenCalled();
  });

  it('destroi o grafico anterior ao trocar dados e ao destruir', async () => {
    const fixture = await montar(aportes);
    const primeiro = vi.mocked(Chart).mock.results.at(-1)!.value;
    fixture.componentRef.setInput('aportes', [{ mes: '2026-04', total: 9 }]);
    await fixture.whenStable();
    expect(primeiro.destroy).toHaveBeenCalled();
    const segundo = vi.mocked(Chart).mock.results.at(-1)!.value;
    fixture.destroy();
    expect(segundo.destroy).toHaveBeenCalled();
  });
});
