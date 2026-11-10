import { Component, DestroyRef, effect, ElementRef, inject, input, viewChild } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { AporteMes } from './dashboard.service';

const meses = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const cor = (variavel: string) => getComputedStyle(document.documentElement).getPropertyValue(variavel).trim();

const rotulo =(mes: string) => {
  const [ano, numero] = mes.split('-');
  return `${meses[Number(numero) - 1]}/${ano.slice(2)}`;
};

@Component({
  selector: 'app-grafico-aportes',
  template: `
    @if (vazio()) {
      <p>Nenhum aporte nos últimos 12 meses</p>
    } @else {
      <canvas #canvas></canvas>
    }
  `,
})
export class GraficoAportes {
  aportes = input.required<AporteMes[]>();
  private canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');
  private chart?: Chart;

  vazio = () => this.aportes().every((a) => a.total === 0);

  constructor() {
    inject(DestroyRef).onDestroy(() => this.chart?.destroy());
    effect(() => {
      const aportes = this.aportes();
      const canvas = this.canvas();
      this.chart?.destroy();
      this.chart = undefined;
      if (!canvas) return;
      this.chart = new Chart(canvas.nativeElement, {
        type: 'bar',
        data: {
          labels: aportes.map((a) => rotulo(a.mes)),
          datasets: [{ label: 'Aportes', data: aportes.map((a) => a.total), backgroundColor: cor('--purple') }],
        },
        options: { maintainAspectRatio: false },
      });
    });
  }
}
