import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Estado, FormSimulador, naoNegativo, prazo } from './form-simulador';
import { GraficoEvolucao } from './grafico-evolucao';
import { SimulacaoService } from './simulacao.service';

@Component({
  selector: 'app-investimento',
  imports: [FormSimulador, GraficoEvolucao, CurrencyPipe],
  template: `
    <h2>Investimento</h2>
    <app-form-simulador [estado]="estado">
      @if (estado.resultado(); as r) {
        <p>Saldo final: {{ r.saldoFinal | currency: 'BRL' }}</p>
        <p>Total investido: {{ r.totalInvestido | currency: 'BRL' }}</p>
        <p>Juros: {{ r.totalJuros | currency: 'BRL' }}</p>
        <app-grafico-evolucao [evolucao]="r.evolucao" />
      }
    </app-form-simulador>
  `,
})
export class Investimento {
  private api = inject(SimulacaoService);
  estado = new Estado(
    [
      { nome: 'valorInicial', rotulo: 'Valor inicial', validadores: naoNegativo },
      { nome: 'aporteMensal', rotulo: 'Aporte mensal', validadores: naoNegativo },
      { nome: 'taxaMensal', rotulo: 'Taxa mensal (%)', validadores: naoNegativo },
      { nome: 'meses', rotulo: 'Prazo (meses)', validadores: prazo },
    ],
    (v) => this.api.investimento(v),
  );
}
