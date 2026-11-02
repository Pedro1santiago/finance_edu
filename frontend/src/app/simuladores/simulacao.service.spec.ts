import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { SimulacaoService } from './simulacao.service';

describe('SimulacaoService', () => {
  const casos = [
    ['jurosCompostos', 'juros-compostos', { capital: 1000, taxaMensal: 1, meses: 12 }],
    ['investimento', 'investimento', { valorInicial: 1000, aporteMensal: 100, taxaMensal: 1, meses: 12 }],
    ['parcelamento', 'parcelamento', { valor: 1000, taxaMensal: 0, parcelas: 10 }],
    ['economia', 'economia', { objetivo: 1000, economiaMensal: 100 }],
  ] as const;

  it.each(casos)('%s faz POST com o corpo', (metodo, caminho, corpo) => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    const s = TestBed.inject(SimulacaoService);
    const http = TestBed.inject(HttpTestingController);
    let resposta: unknown;
    (s[metodo] as (c: object) => { subscribe: (f: (r: unknown) => void) => void })(corpo).subscribe((r) => (resposta = r));
    const req = http.expectOne(`${environment.apiUrl}/api/simulacoes/${caminho}`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(corpo);
    req.flush({ ok: 1 });
    expect(resposta).toEqual({ ok: 1 });
    http.verify();
  });
});
