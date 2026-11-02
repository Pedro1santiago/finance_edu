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
        <p>Parcela: {{ r.valorParcela | currency: 'BRL' }}</p>
        <p>Total pago: {{ r.totalPago | currency: 'BRL' }}</p>
        <p>Juros: {{ r.totalJuros | currency: 'BRL' }}</p>
      }
    </app-form-simulador>
  `,
})
export class Parcelamento {
  private api = inject(SimulacaoService);
  estado = new Estado(
    [
      { nome: 'valor', rotulo: 'Valor', validadores: [positivo] },
      { nome: 'taxaMensal', rotulo: 'Taxa mensal (%)', validadores: naoNegativo },
      { nome: 'parcelas', rotulo: 'Parcelas', validadores: prazo },
    ],
    (v) => this.api.parcelamento(v),
  );
}
