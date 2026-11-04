import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-nao-encontrado',
  imports: [RouterLink],
  template: `
    <h2>Página não encontrada</h2>
    <p><a routerLink="/dashboard">Voltar ao dashboard</a></p>
  `,
})
export class NaoEncontrado {}
