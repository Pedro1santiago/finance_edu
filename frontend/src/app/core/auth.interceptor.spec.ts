import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { authInterceptor } from './auth.interceptor';
import { gravarToken, lerToken } from './token';

describe('authInterceptor', () => {
  let http: HttpClient;
  let ctrl: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    gravarToken('abc');
    TestBed.configureTestingModule({
      providers: [provideRouter([]), provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpClient);
    ctrl = TestBed.inject(HttpTestingController);
  });

  it('anexa Bearer nas rotas da API', () => {
    http.get(`${environment.apiUrl}/api/metas`).subscribe();
    expect(ctrl.expectOne(`${environment.apiUrl}/api/metas`).request.headers.get('Authorization')).toBe('Bearer abc');
  });

  it('nao anexa Bearer em /api/auth/*', () => {
    http.post(`${environment.apiUrl}/api/auth/login`, {}).subscribe();
    expect(ctrl.expectOne(`${environment.apiUrl}/api/auth/login`).request.headers.has('Authorization')).toBe(false);
  });

  it('nao anexa Bearer em outros hosts', () => {
    http.get('https://outro.com/x').subscribe();
    expect(ctrl.expectOne('https://outro.com/x').request.headers.has('Authorization')).toBe(false);
  });

  it('em 401 remove o token e vai para /login', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    http.get(`${environment.apiUrl}/api/metas`).subscribe({ error: () => undefined });
    ctrl.expectOne(`${environment.apiUrl}/api/metas`).flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(lerToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
