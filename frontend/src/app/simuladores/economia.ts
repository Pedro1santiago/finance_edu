import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Estado, FormSimulador, positivo } from './form-simulador';
import { SimulacaoService } from './simulacao.service';

@Component({
  selector: 'app-economia',
  imports: [FormSimulador, CurrencyPipe],
  template: `
    <h2>Economia mensal</h2>
    <app-form-simulador [estado]="estado">
      @if (estado.resultado(); as r) {
        <div class="result-eyebrow">MESES NECESSÁRIOS</div>
        <div class="result-amount">{{ r.mesesNecessarios }} {{ r.mesesNecessarios === 1 ? 'mês' : 'meses' }}</div>
        <div class="result-divider"></div>
        <div class="result-line"><span>Economia anual</span><strong class="result-growth">{{ r.economiaAnual | currency: 'BRL' }}</strong></div>
      }
    </app-form-simulador>
  `,
})
export class Economia {
  private api = inject(SimulacaoService);
  estado = new Estado(
    [
      { nome: 'objetivo', rotulo: 'Objetivo', unidade: 'R$', validadores: [positivo] },
      { nome: 'economiaMensal', rotulo: 'Economia mensal', unidade: 'R$', validadores: [positivo] },
    ],
    (v) => this.api.economia(v),
  );
}
