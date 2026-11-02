import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { MetaService } from './meta.service';

describe('MetaService', () => {
  const chamar = (metodo: string, caminho: string, corpo: unknown, usar: (s: MetaService) => Observable<unknown>) => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    let resposta: unknown;
    usar(TestBed.inject(MetaService)).subscribe((r) => (resposta = r));
    const req = http.expectOne(`${environment.apiUrl}/api/metas${caminho}`);
    expect(req.request.method).toBe(metodo);
    if (corpo !== undefined) expect(req.request.body).toEqual(corpo);
    req.flush({ ok: 1 });
    expect(resposta).toEqual({ ok: 1 });
    http.verify();
  };
  const dados = { nome: 'Viagem', valorAlvo: 5000, prazo: '2030-01-01' };
  const aporte = { valor: 1000, data: '2026-11-02' };

  it('listar', () => chamar('GET', '', undefined, (s) => s.listar()));
  it('buscar', () => chamar('GET', '/7', undefined, (s) => s.buscar(7)));
  it('criar', () => chamar('POST', '', dados, (s) => s.criar(dados)));
  it('alterar', () => chamar('PUT', '/7', dados, (s) => s.alterar(7, dados)));
  it('excluir', () => chamar('DELETE', '/7', undefined, (s) => s.excluir(7)));
  it('registrarAporte', () => chamar('POST', '/7/aportes', aporte, (s) => s.registrarAporte(7, aporte)));
  it('aportes', () => chamar('GET', '/7/aportes', undefined, (s) => s.aportes(7)));
});
