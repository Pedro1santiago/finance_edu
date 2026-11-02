import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ConteudoService } from './conteudo.service';

describe('ConteudoService', () => {
  const chamar = (metodo: string, caminho: string, usar: (s: ConteudoService) => Observable<unknown>) => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    let resposta: unknown;
    usar(TestBed.inject(ConteudoService)).subscribe((r) => (resposta = r));
    const req = http.expectOne(`${environment.apiUrl}/api${caminho}`);
    expect(req.request.method).toBe(metodo);
    req.flush({ ok: 1 });
    expect(resposta).toEqual({ ok: 1 });
    http.verify();
  };

  it('modulos', () => chamar('GET', '/modulos', (s) => s.modulos()));
  it('conteudosDoModulo', () => chamar('GET', '/modulos/3/conteudos', (s) => s.conteudosDoModulo(3)));
  it('conteudo', () => chamar('GET', '/conteudos/5', (s) => s.conteudo(5)));
  it('concluir', () => chamar('POST', '/conteudos/5/concluir', (s) => s.concluir(5)));
  it('progresso', () => chamar('GET', '/progresso/conteudos', (s) => s.progresso()));
});
