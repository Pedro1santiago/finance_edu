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
        <div class="result-eyebrow">SALDO FINAL</div>
        <div class="result-amount">{{ r.saldoFinal | currency: 'BRL' }}</div>
        <div class="result-divider"></div>
        <div class="result-line"><span>Total investido</span><strong>{{ r.totalInvestido | currency: 'BRL' }}</strong></div>
        <div class="result-line"><span>Juros</span><strong class="result-growth">{{ r.totalJuros | currency: 'BRL' }}</strong></div>
      }
    </app-form-simulador>
    @if (estado.resultado(); as r) {
      <section class="dashboard-panel grafico-painel">
        <div class="panel-heading"><div><h3>Evolução do saldo</h3></div></div>
        <div class="grafico"><app-grafico-evolucao [evolucao]="r.evolucao" /></div>
      </section>
    }
  `,
  styles: `.grafico-painel { margin-top: 16px; min-height: 0; }`,
})
export class Investimento {
  private api = inject(SimulacaoService);
  estado = new Estado(
    [
      { nome: 'valorInicial', rotulo: 'Valor inicial', unidade: 'R$', validadores: naoNegativo },
      { nome: 'aporteMensal', rotulo: 'Aporte mensal', unidade: 'R$', validadores: naoNegativo },
      { nome: 'taxaMensal', rotulo: 'Taxa mensal', mensagem: 'Taxa mensal (%)', unidade: '%', validadores: naoNegativo },
      { nome: 'meses', rotulo: 'Prazo', mensagem: 'Prazo (meses)', unidade: 'meses', validadores: prazo },
    ],
    (v) => this.api.investimento(v),
  );
}
