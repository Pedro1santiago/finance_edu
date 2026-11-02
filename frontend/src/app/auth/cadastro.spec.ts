import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Cadastro } from './cadastro';

describe('Cadastro', () => {
  const registrar = vi.fn();

  const montar = async () => {
    registrar.mockReset();
    await TestBed.configureTestingModule({
      imports: [Cadastro],
      providers: [provideRouter([]), { provide: AuthService, useValue: { registrar } }],
    }).compileComponents();
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigateByUrl').mockResolvedValue(true);
    const fixture = TestBed.createComponent(Cadastro);
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

  it('senha com 7 caracteres mostra erro no campo e nao chama a API', async () => {
    const { el, preencher, enviar } = await montar();
    preencher('nome', 'Ana');
    preencher('email', 'a@a.com');
    preencher('senha', '1234567');
    await enviar();
    expect(registrar).not.toHaveBeenCalled();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('8 a 72');
  });

  it('nome so com espacos nao chama a API', async () => {
    const { preencher, enviar } = await montar();
    preencher('nome', '   ');
    preencher('email', 'a@a.com');
    preencher('senha', '12345678');
    await enviar();
    expect(registrar).not.toHaveBeenCalled();
  });

  it('sucesso chama o service e navega para /dashboard', async () => {
    const { navigate, preencher, enviar } = await montar();
    registrar.mockReturnValue(of({}));
    preencher('nome', 'Ana');
    preencher('email', 'a@a.com');
    preencher('senha', '12345678');
    await enviar();
    expect(registrar).toHaveBeenCalledWith({ nome: 'Ana', email: 'a@a.com', senha: '12345678' });
    expect(navigate).toHaveBeenCalledWith('/dashboard');
  });

  it('email duplicado mostra a mensagem do back', async () => {
    const { el, preencher, enviar } = await montar();
    registrar.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'Email já cadastrado' } })));
    preencher('nome', 'Ana');
    preencher('email', 'a@a.com');
    preencher('senha', '12345678');
    await enviar();
    expect(el.querySelector('[role=alert]')?.textContent).toContain('Email já cadastrado');
  });

  it('tem link para o login', async () => {
    const { el } = await montar();
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/login');
  });
});
