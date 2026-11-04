import { HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { Estado, positivo } from './form-simulador';

describe('Estado', () => {
  const criar = (chamar: () => Observable<string>) => new Estado([{ nome: 'x', rotulo: 'X', validadores: [positivo] }], chamar);

  it('submit invalido limpa o resultado anterior', () => {
    const e = criar(() => of('ok'));
    e.form.setValue({ x: 1 });
    e.enviar();
    expect(e.resultado()).toBe('ok');
    e.form.setValue({ x: 0 });
    e.enviar();
    expect(e.resultado()).toBeNull();
  });

  it('submit invalido limpa o erro do servidor anterior', () => {
    const e = criar(() => throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'falhou' } })));
    e.form.setValue({ x: 1 });
    e.enviar();
    expect(e.erro()).toBe('falhou');
    e.form.setValue({ x: 0 });
    e.enviar();
    expect(e.erro()).toBe('');
  });
});
