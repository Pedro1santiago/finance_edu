import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, convertToParamMap, provideRouter } from '@angular/router';
import { Subject, of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Login } from './login';

describe('Login', () => {
  const login = vi.fn();

  const montar = async (returnUrl?: string) => {
    login.mockReset();
    const queryParamMap = convertToParamMap(returnUrl === undefined ? {} : { returnUrl });
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: { login } },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap } } },
      ],
    }).compileComponents();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Login);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const preencher = (nome: string, valor: string) => {
      const i = el.querySelector<HTMLInputElement>(`input[name=${nome}]`)!;
      i.value = valor;
      i.dispatchEvent(new Event('input'));
    };
    const enviar = async () => {
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await fixture.whenStable();
      fixture.detectChanges();
    };
    return { el, navigate, preencher, enviar };
  };

  it('form valido chama o service e navega para /dashboard', async () => {
    const { navigate, preencher, enviar } = await montar();
    login.mockReturnValue(of({}));
    preencher('email', 'a@a.com');
    preencher('senha', '12345678');
    await enviar();
    expect(login).toHaveBeenCalledWith({ email: 'a@a.com', senha: '12345678' });
    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });

  it.each([
    ['/metas', '/metas'],
    ['/conteudos/modulos/2?x=1', '/conteudos/modulos/2?x=1'],
    ['//evil.com', '/dashboard'],
    ['/\\evil.com', '/dashboard'],
    ['https://evil.com', '/dashboard'],
    ['metas', '/dashboard'],
  ])('returnUrl %s navega para %s apos o login', async (returnUrl, destino) => {
    const { navigate, preencher, enviar } = await montar(returnUrl);
    login.mockReturnValue(of({}));
    preencher('email', 'a@a.com');
    preencher('senha', '12345678');
    await enviar();
    expect(navigate).toHaveBeenCalledWith(destino);
  });

  it('erro mostra o detail e nao navega', async () => {
    const { el, navigate, preencher, enviar } = await montar();
    login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 401, error: { detail: 'Credenciais inválidas' } })));
    preencher('email', 'a@a.com');
    preencher('senha', '12345678');
    await enviar();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Credenciais inválidas');
    expect(navigate).not.toHaveBeenCalled();
  });

  it('sem detail mostra mensagem de conexao', async () => {
    const { el, preencher, enviar } = await montar();
    login.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    preencher('email', 'a@a.com');
    preencher('senha', '12345678');
    await enviar();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Não foi possível conectar');
  });

  it('duplo submit em voo envia uma vez e desabilita o botao', async () => {
    const { el, preencher, enviar } = await montar();
    login.mockReturnValue(new Subject());
    preencher('email', 'a@a.com');
    preencher('senha', '12345678');
    await enviar();
    await enviar();
    expect(login).toHaveBeenCalledTimes(1);
    expect(el.querySelector<HTMLButtonElement>('button[type=submit]')!.disabled).toBe(true);
  });

  it('form invalido nao chama o service', async () => {
    const { preencher, enviar } = await montar();
    preencher('email', 'a@a.com');
    preencher('senha', '1234567');
    await enviar();
    expect(login).not.toHaveBeenCalled();
  });
});
