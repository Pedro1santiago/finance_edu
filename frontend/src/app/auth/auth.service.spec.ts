import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { gravarToken, lerToken, removerToken } from '../core/token';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let ctrl: HttpTestingController;

  beforeEach(() => {
    removerToken();
    TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()] });
    service = TestBed.inject(AuthService);
    ctrl = TestBed.inject(HttpTestingController);
  });

  it('login grava o token', () => {
    service.login({ email: 'a@a.com', senha: '12345678' }).subscribe();
    const req = ctrl.expectOne(`${environment.apiUrl}/api/auth/login`);
    expect(req.request.body).toEqual({ email: 'a@a.com', senha: '12345678' });
    req.flush({ token: 'tk', usuario: {} });
    expect(lerToken()).toBe('tk');
  });

  it('registrar grava o token', () => {
    service.registrar({ nome: 'A', email: 'a@a.com', senha: '12345678' }).subscribe();
    ctrl.expectOne(`${environment.apiUrl}/api/auth/register`).flush({ token: 'tk2', usuario: {} });
    expect(lerToken()).toBe('tk2');
  });

  it('sair remove o token e navega para /login', () => {
    gravarToken('x');
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    service.sair();
    expect(lerToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith('/login');
  });
});
