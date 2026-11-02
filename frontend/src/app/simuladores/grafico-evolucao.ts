import { Component, DestroyRef, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { PontoEvolucao } from './simulacao.service';

@Component({
  selector: 'app-grafico-evolucao',
  template: `<canvas #canvas></canvas>`,
})
export class GraficoEvolucao {
  evolucao = input.required<PontoEvolucao[]>();
  private canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
    effect(() => {
      const pontos = this.evolucao();
      this.chart?.destroy();
      this.chart = new Chart(this.canvas().nativeElement, {
        type: 'line',
        data: {
          labels: pontos.map((p) => p.mes),
          datasets: [
            { label: 'Saldo', data: pontos.map((p) => p.saldo) },
            { label: 'Total investido', data: pontos.map((p) => p.totalInvestido) },
          ],
        },
      });
    });
  }
}
