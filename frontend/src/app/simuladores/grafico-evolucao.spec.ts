import { TestBed } from '@angular/core/testing';
import { Chart } from 'chart.js/auto';
import { GraficoEvolucao } from './grafico-evolucao';

vi.mock('chart.js/auto', () => ({ Chart: vi.fn(function () { return { destroy: vi.fn() }; }) }));

describe('GraficoEvolucao', () => {
  const evolucao = Array.from({ length: 12 }, (_, i) => ({ mes: i + 1, saldo: 100 * (i + 1), totalInvestido: 90 * (i + 1), juros: 10 * (i + 1) }));

  it('renderiza canvas e cria Chart com 12 labels e 2 datasets', async () => {
    const fixture = TestBed.createComponent(GraficoEvolucao);
    fixture.componentRef.setInput('evolucao', evolucao);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('canvas')).not.toBeNull();
    const cfg = vi.mocked(Chart).mock.calls.at(-1)![1] as { data: { labels: number[]; datasets: { label: string }[] } };
    expect(cfg.data.labels).toHaveLength(12);
    expect(cfg.data.datasets.map((d) => d.label)).toEqual(['Saldo', 'Total investido']);
  });

  it('destroi o grafico ao destruir o componente', async () => {
    const fixture = TestBed.createComponent(GraficoEvolucao);
    fixture.componentRef.setInput('evolucao', evolucao);
    await fixture.whenStable();
    const instancia = vi.mocked(Chart).mock.results.at(-1)!.value as { destroy: () => void };
    fixture.destroy();
    expect(instancia.destroy).toHaveBeenCalled();
  });
});
