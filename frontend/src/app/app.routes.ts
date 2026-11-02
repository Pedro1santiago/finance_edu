import { Routes } from '@angular/router';
import { Cadastro } from './auth/cadastro';
import { Login } from './auth/login';
import { authGuard, visitanteGuard } from './core/auth.guard';
import { Layout } from './core/layout/layout';
import { ConteudoLeitura } from './conteudos/conteudo-leitura';
import { ModuloDetalhe } from './conteudos/modulo-detalhe';
import { Modulos } from './conteudos/modulos';
import { Dashboard } from './dashboard/dashboard';
import { MetaDetalhe } from './metas/meta-detalhe';
import { Metas } from './metas/metas';
import { Simuladores } from './simuladores/simuladores';

export const routes: Routes = [
  { path: 'login', component: Login, canActivate: [visitanteGuard] },
  { path: 'cadastro', component: Cadastro, canActivate: [visitanteGuard] },
  {
    path: '',
    component: Layout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: Dashboard },
      { path: 'conteudos', component: Modulos },
      { path: 'conteudos/modulos/:id', component: ModuloDetalhe },
      { path: 'conteudos/:id', component: ConteudoLeitura },
      { path: 'simuladores', component: Simuladores },
      { path: 'metas', component: Metas },
      { path: 'metas/:id', component: MetaDetalhe },
    ],
  },
];
