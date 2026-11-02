import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let http: HttpTestingController;
  let service: DashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
    service = TestBed.inject(DashboardService);
  });

  it('obter busca /api/dashboard', () => {
    let resposta: unknown;
    service.obter().subscribe((r) => (resposta = r));
    const req = http.expectOne(`${environment.apiUrl}/api/dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush({ ok: 1 });
    expect(resposta).toEqual({ ok: 1 });
    http.verify();
  });

  it('evolucaoAportes envia meses', () => {
    let resposta: unknown;
    service.evolucaoAportes(12).subscribe((r) => (resposta = r));
    const req = http.expectOne((r) => r.url === `${environment.apiUrl}/api/dashboard/evolucao-aportes`);
    expect(req.request.params.get('meses')).toBe('12');
    req.flush([{ mes: '2026-01', total: 5 }]);
    expect(resposta).toEqual([{ mes: '2026-01', total: 5 }]);
    http.verify();
  });
});
