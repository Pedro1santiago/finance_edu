import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Estado, FormSimulador, naoNegativo, positivo, prazo } from './form-simulador';
import { SimulacaoService } from './simulacao.service';

@Component({
  selector: 'app-parcelamento',
  imports: [FormSimulador, CurrencyPipe],
  template: `
    <h2>Parcelamento</h2>
    <app-form-simulador [estado]="estado">
      @if (estado.resultado(); as r) {
        <div class="result-eyebrow">PARCELA</div>
        <div class="result-amount">{{ r.valorParcela | currency: 'BRL' }}</div>
        <div class="result-divider"></div>
        <div class="result-line"><span>Total pago</span><strong>{{ r.totalPago | currency: 'BRL' }}</strong></div>
        <div class="result-line"><span>Juros</span><strong class="result-growth">{{ r.totalJuros | currency: 'BRL' }}</strong></div>
      }
    </app-form-simulador>
  `,
})
export class Parcelamento {
  private api = inject(SimulacaoService);
  estado = new Estado(
    [
      { nome: 'valor', rotulo: 'Valor', unidade: 'R$', validadores: [positivo] },
      { nome: 'taxaMensal', rotulo: 'Taxa mensal', unidade: '%', validadores: naoNegativo },
      { nome: 'parcelas', rotulo: 'Parcelas', unidade: 'x', validadores: prazo },
    ],
    (v) => this.api.parcelamento(v),
  );
}
