import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrado',
  imports: [RouterLink],
  template: `
    <div class="empty-state">
      <div class="empty-icon" aria-hidden="true">?</div>
      <h2>Página não encontrada</h2>
      <p>O endereço acessado não existe.</p>
      <a class="button button-primary" routerLink="/dashboard">Voltar ao dashboard</a>
    </div>
  `,
})
export class NaoEncontrado {}
