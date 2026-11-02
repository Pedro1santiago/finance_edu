import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Conteudo, ConteudoService } from './conteudo.service';
import { ConteudoLeitura } from './conteudo-leitura';

const conteudo = (extra: Partial<Conteudo> = {}): Conteudo => ({
  id: 10,
  moduloId: 3,
  titulo: 'Intro',
  corpo: 'Corpo <b>puro</b>',
  ordem: 1,
  concluido: false,
  ...extra,
});

describe('ConteudoLeitura', () => {
  const service = { conteudo: vi.fn(), concluir: vi.fn() };

  const abrir = async (id = '10') => {
    await TestBed.configureTestingModule({
      imports: [ConteudoLeitura],
      providers: [
        provideRouter([]),
        { provide: ConteudoService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ConteudoLeitura);
    const el = fixture.nativeElement as HTMLElement;
    const atualizar = async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
    };
    await atualizar();
    return { el, atualizar };
  };

  beforeEach(() => {
    Object.values(service).forEach((f) => f.mockReset());
    service.conteudo.mockReturnValue(of(conteudo()));
  });

  it('mostra titulo e corpo como texto puro com link para o modulo', async () => {
    const { el } = await abrir();
    expect(service.conteudo).toHaveBeenCalledWith(10);
    expect(el.querySelector('h2')!.textContent).toContain('Intro');
    expect(el.querySelector('p')!.textContent).toBe('Corpo <b>puro</b>');
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/conteudos/modulos/3');
  });

  it.each(['abc', '0', '-1', '1.5'])('id invalido (%s) mostra Conteudo nao encontrado sem requisicao', async (id) => {
    const { el } = await abrir(id);
    expect(el.textContent).toContain('Conteúdo não encontrado');
    expect(service.conteudo).not.toHaveBeenCalled();
  });

  it('404 mostra Conteudo nao encontrado com link para /conteudos', async () => {
    service.conteudo.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const { el } = await abrir('999999');
    expect(el.textContent).toContain('Conteúdo não encontrado');
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/conteudos');
  });

  it('erro de carga mostra alerta', async () => {
    service.conteudo.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const { el } = await abrir();
    expect(el.querySelector('[role=alert]')!.textContent).toContain('Não foi possível conectar');
  });
});
