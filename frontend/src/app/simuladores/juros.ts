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
        <p>Montante: {{ r.montante | currency: 'BRL' }}</p>
        <p>Juros: {{ r.juros | currency: 'BRL' }}</p>
      }
    </app-form-simulador>
  `,
})
export class Juros {
  private api = inject(SimulacaoService);
  estado = new Estado(
    [
      { nome: 'capital', rotulo: 'Capital', validadores: [positivo] },
      { nome: 'taxaMensal', rotulo: 'Taxa mensal (%)', validadores: naoNegativo },
      { nome: 'meses', rotulo: 'Prazo (meses)', validadores: prazo },
    ],
    (v) => this.api.jurosCompostos(v),
  );
}
