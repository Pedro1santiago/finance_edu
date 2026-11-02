import { Component } from '@angular/core';
import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { Layout } from './core/layout/layout';

@Component({ template: '' })
class Placeholder {}

export const routes: Routes = [
  { path: 'login', component: Placeholder },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Placeholder },
      { path: 'conteudos', component: Placeholder },
      { path: 'simuladores', component: Placeholder },
      { path: 'metas', component: Placeholder },
    ],
  },
];
