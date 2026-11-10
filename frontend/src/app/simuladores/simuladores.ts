import { Component, ElementRef, signal, viewChildren } from '@angular/core';
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
          <button #aba type="button" role="tab" class="sim-tab" [id]="'aba-' + o" aria-controls="painel-simulador" [class.active]="atual() === o" [attr.aria-selected]="atual() === o" [attr.tabindex]="atual() === o ? 0 : -1" (click)="atual.set(o)" (keydown.arrowright)="mover(1, $event)" (keydown.arrowleft)="mover(-1, $event)">{{ nomes[o] }}</button>
        }
      </div>
      <div class="sim-body" role="tabpanel" id="painel-simulador" [attr.aria-labelledby]="'aba-' + atual()">
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
  private abas = viewChildren<ElementRef<HTMLButtonElement>>('aba');

  mover(passo: number, evento: Event) {
    evento.preventDefault();
    const i = (opcoes.indexOf(this.atual()) + passo + opcoes.length) % opcoes.length;
    this.atual.set(opcoes[i]);
    this.abas()[i].nativeElement.focus();
  }
}
