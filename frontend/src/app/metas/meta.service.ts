import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

export interface MetaIn { nome: string; valorAlvo: number; prazo: string }
export interface Meta extends MetaIn {
  id: number;
  criadaEm: string;
  totalEconomizado: number;
  valorRestante: number;
  percentualAtingido: number;
  status: 'ATIVA' | 'CONCLUIDA';
  estimativaConclusao: string | null;
}
export const rotuloStatus: Record<Meta['status'], string> = { ATIVA: 'Ativa', CONCLUIDA: 'Concluída' };
export interface AporteIn { valor: number; data: string }
export interface Aporte extends AporteIn { id: number }

@Injectable({ providedIn: 'root' })
export class MetaService {
  private http = inject(HttpClient);
  private url = `${environment.apiUrl}/api/metas`;

  listar = () => this.http.get<Meta[]>(this.url);
  buscar = (id: number) => this.http.get<Meta>(`${this.url}/${id}`);
  criar = (d: MetaIn) => this.http.post<Meta>(this.url, d);
  alterar = (id: number, d: MetaIn) => this.http.put<Meta>(`${this.url}/${id}`, d);
  excluir = (id: number) => this.http.delete<void>(`${this.url}/${id}`);
  registrarAporte = (id: number, d: AporteIn) => this.http.post<Aporte>(`${this.url}/${id}/aportes`, d);
  aportes = (id: number) => this.http.get<Aporte[]>(`${this.url}/${id}/aportes`);
}
