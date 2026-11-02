import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SimulacaoService } from './simulacao.service';

describe('SimulacaoService', () => {
  const postar = (caminho: string, corpo: object, chamar: (s: SimulacaoService) => Observable<unknown>) => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const http = TestBed.inject(HttpTestingController);
    let resposta: unknown;
    chamar(TestBed.inject(SimulacaoService)).subscribe((r) => (resposta = r));
    const req = http.expectOne(`${environment.apiUrl}/api/simulacoes/${caminho}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(corpo);
    req.flush({ ok: 1 });
    expect(resposta).toEqual({ ok: 1 });
    http.verify();
  };

  it('jurosCompostos faz POST com o corpo', () => {
    const corpo = { capital: 1000, taxaMensal: 1, meses: 12 };
    postar('juros-compostos', corpo, (s) => s.jurosCompostos(corpo));
  });

  it('investimento faz POST com o corpo', () => {
    const corpo = { valorInicial: 1000, aporteMensal: 100, taxaMensal: 1, meses: 12 };
    postar('investimento', corpo, (s) => s.investimento(corpo));
  });

  it('parcelamento faz POST com o corpo', () => {
    const corpo = { valor: 1000, taxaMensal: 0, parcelas: 10 };
    postar('parcelamento', corpo, (s) => s.parcelamento(corpo));
  });

  it('economia faz POST com o corpo', () => {
    const corpo = { objetivo: 1000, economiaMensal: 100 };
    postar('economia', corpo, (s) => s.economia(corpo));
  });
});
