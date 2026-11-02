import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { Cadastro } from './auth/cadastro';
import { Login } from './auth/login';
import { authGuard, visitanteGuard } from './core/auth.guard';
import { Layout } from './core/layout/layout';
import { Simuladores } from './simuladores/simuladores';

@Component({ template: '' })
class Placeholder {}

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [visitanteGuard] },
  { path: 'cadastro', component: Cadastro, canActivate: [visitanteGuard] },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Placeholder },
      { path: 'conteudos', component: Placeholder },
      { path: 'simuladores', component: Simuladores },
      { path: 'metas', component: Placeholder },
    ],
  },
];
