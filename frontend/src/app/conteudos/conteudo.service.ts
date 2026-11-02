import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export interface Modulo { id: number; titulo: string; descricao: string; ordem: number }
export interface Conteudo { id: number; moduloId: number; titulo: string; corpo: string; ordem: number; concluido: boolean }
export interface ProgressoModulo { moduloId: number; titulo: string; total: number; concluidos: number; percentual: number }

@Injectable({ providedIn: 'root' })
export class ConteudoService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api`;

  modulos = () => this.http.get<Modulo[]>(`${this.url}/modulos`);
  conteudosDoModulo = (id: number) => this.http.get<Conteudo[]>(`${this.url}/modulos/${id}/conteudos`);
  conteudo = (id: number) => this.http.get<Conteudo>(`${this.url}/conteudos/${id}`);
  concluir = (id: number) => this.http.post<void>(`${this.url}/conteudos/${id}/concluir`, null);
  progresso = () => this.http.get<ProgressoModulo[]>(`${this.url}/progresso/conteudos`);
}
