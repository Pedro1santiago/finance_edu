import { Component, signal } from '@angular/core';
import { Economia } from './economia';
import { Investimento } from './investimento';
import { Juros } from './juros';
import { Parcelamento } from './parcelamento';

const opcoes = ['juros', 'investimento', 'parcelamento', 'economia'] as const;
const nomes = { juros: 'Juros compostos', investimento: 'Investimento', parcelamento: 'Parcelamento', economia: 'Economia mensal' };

@Component({
  selector: 'app-simuladores',
  imports: [Juros, Investimento, Parcelamento, Economia],
  template: `
    <div class="page-intro">
      <h1>Simuladores</h1>
      <p class="page-lead">Simule cenários antes de decidir.</p>
    </div>
    <div class="simulator-card">
      <div class="sim-tabs" role="tablist" aria-label="Tipo de simulação">
        @for (o of opcoes; track o) {
          <button type="button" role="tab" class="sim-tab" [class.active]="atual() === o" [attr.aria-selected]="atual() === o" (click)="atual.set(o)">{{ nomes[o] }}</button>
        }
      </div>
      <div class="sim-body" role="tabpanel">
        @switch (atual()) {
          @case ('juros') { <app-juros /> }
          @case ('investimento') { <app-investimento /> }
          @case ('parcelamento') { <app-parcelamento /> }
          @case ('economia') { <app-economia /> }
        }
      </div>
    </div>
  `,
  styles: `
    .sim-body { padding: 20px; }
  `,
})
export class Simuladores {
  opcoes = opcoes;
  nomes = nomes;
  atual = signal<(typeof opcoes)[number]>('juros');
}
