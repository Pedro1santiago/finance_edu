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
    <h1>Simuladores</h1>
    <nav>
      @for (o of opcoes; track o) {
        <button type="button" [attr.aria-pressed]="atual() === o" (click)="atual.set(o)">{{ nomes[o] }}</button>
      }
    </nav>
    @switch (atual()) {
      @case ('juros') { <app-juros /> }
      @case ('investimento') { <app-investimento /> }
      @case ('parcelamento') { <app-parcelamento /> }
      @case ('economia') { <app-economia /> }
    }
  `,
})
export class Simuladores {
  opcoes = opcoes;
  nomes = nomes;
  atual = signal<(typeof opcoes)[number]>('juros');
}
