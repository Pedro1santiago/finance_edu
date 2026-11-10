import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Estado, FormSimulador, naoNegativo, positivo, prazo } from './form-simulador';
import { SimulacaoService } from './simulacao.service';

@Component({
  selector: 'app-juros',
  imports: [FormSimulador, CurrencyPipe],
  template: `
    <h2>Juros compostos</h2>
    <app-form-simulador [estado]="estado">
      @if (estado.resultado(); as r) {
        <div class="result-eyebrow">MONTANTE</div>
        <div class="result-amount">{{ r.montante | currency: 'BRL' }}</div>
        <div class="result-divider"></div>
        <div class="result-line"><span>Juros</span><strong class="result-growth">{{ r.juros | currency: 'BRL' }}</strong></div>
      }
    </app-form-simulador>
  `,
})
export class Juros {
  private api = inject(SimulacaoService);
  estado = new Estado(
    [
      { nome: 'capital', rotulo: 'Capital', unidade: 'R$', validadores: [positivo] },
      { nome: 'taxaMensal', rotulo: 'Taxa mensal', mensagem: 'Taxa mensal (%)', unidade: '%', validadores: naoNegativo },
      { nome: 'meses', rotulo: 'Prazo', mensagem: 'Prazo (meses)', unidade: 'meses', validadores: prazo },
    ],
    (v) => this.api.jurosCompostos(v),
  );
}
