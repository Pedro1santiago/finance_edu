import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { Conteudo, ConteudoService } from './conteudo.service';
import { ModuloDetalhe } from './modulo-detalhe';

const conteudo = (extra: Partial<Conteudo>): Conteudo => ({
  id: 1,
  moduloId: 1,
  titulo: 'Intro',
  corpo: 'texto',
  ordem: 1,
  concluido: false,
  ...extra,
});

describe('ModuloDetalhe', () => {
  const service = { modulos: vi.fn(), conteudosDoModulo: vi.fn() };

  const abrir = async (id = '1') => {
    await TestBed.configureTestingModule({
      imports: [ModuloDetalhe],
      providers: [
        provideRouter([]),
        { provide: ConteudoService, useValue: service },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: convertToParamMap({ id }) } } },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ModuloDetalhe);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => {
    Object.values(service).forEach((f) => f.mockReset());
    service.modulos.mockReturnValue(of([{ id: 1, titulo: 'Orcamento', descricao: 'd', ordem: 1 }]));
    service.conteudosDoModulo.mockReturnValue(
      of([conteudo({ id: 10, titulo: 'Primeiro', concluido: true }), conteudo({ id: 11, titulo: 'Segundo', ordem: 2 })]),
    );
  });

  it('mostra titulo do modulo e conteudos com marca de concluido', async () => {
    const el = await abrir();
    expect(service.conteudosDoModulo).toHaveBeenCalledWith(1);
    expect(el.querySelector('h2')!.textContent).toContain('Orcamento');
    const itens = el.querySelectorAll('li');
    expect(itens.length).toBe(2);
    expect(itens[0].textContent).toContain('Primeiro');
    expect(itens[0].textContent).toContain('Concluído');
    expect(itens[1].textContent).not.toContain('Concluído');
    expect(itens[0].querySelector('a')!.getAttribute('href')).toBe('/conteudos/10');
  });

  it.each(['abc', '0', '-1', '1.5'])('id invalido (%s) mostra Modulo nao encontrado sem requisicao', async (id) => {
    const el = await abrir(id);
    expect(el.textContent).toContain('Módulo não encontrado');
    expect(service.modulos).not.toHaveBeenCalled();
    expect(service.conteudosDoModulo).not.toHaveBeenCalled();
  });

  it('404 mostra Modulo nao encontrado com link para /conteudos', async () => {
    service.conteudosDoModulo.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 404 })));
    const el = await abrir('999999');
    expect(el.textContent).toContain('Módulo não encontrado');
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/conteudos');
  });

  it('erro de carga mostra alerta', async () => {
    service.modulos.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    const el = await abrir();
    expect(el.querySelector('[role=alert]')!.textContent).toContain('Não foi possível conectar');
    expect(el.querySelectorAll('li').length).toBe(0);
  });
});
