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
        <p>Meses necessários: {{ r.mesesNecessarios }} meses</p>
        <p>Economia anual: {{ r.economiaAnual | currency: 'BRL' }}</p>
      }
    </app-form-simulador>
  `,
})
export class Economia {
  private api = inject(SimulacaoService);
  estado = new Estado(
    [
      { nome: 'objetivo', rotulo: 'Objetivo', validadores: [positivo] },
      { nome: 'economiaMensal', rotulo: 'Economia mensal', validadores: [positivo] },
    ],
    (v) => this.api.economia(v),
  );
}
