import { HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ConteudoService } from './conteudo.service';
import { Modulos } from './modulos';

registerLocaleData(localePt);

describe('Modulos', () => {
  const service = { modulos: vi.fn(), progresso: vi.fn() };

  const abrir = async () => {
    await TestBed.configureTestingModule({
      imports: [Modulos],
      providers: [provideRouter([]), { provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: ConteudoService, useValue: service }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Modulos);
    await fixture.whenStable();
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  };

  beforeEach(() => Object.values(service).forEach((f) => f.mockReset()));

  it('mostra modulos com descricao e progresso', async () => {
    service.modulos.mockReturnValue(
      of([
        { id: 1, titulo: 'Orcamento', descricao: 'Controle seus gastos', ordem: 1 },
        { id: 2, titulo: 'Reserva', descricao: 'Emergencia', ordem: 2 },
      ]),
    );
    service.progresso.mockReturnValue(
      of([
        { moduloId: 1, titulo: 'Orcamento', total: 2, concluidos: 1, percentual: 50 },
        { moduloId: 2, titulo: 'Reserva', total: 3, concluidos: 0, percentual: 0 },
      ]),
    );
    const el = await abrir();
    const texto = el.textContent!;
    expect(texto).toContain('Orcamento');
    expect(texto).toContain('Controle seus gastos');
    expect(texto).toContain('1 de 2 concluídos');
    expect(texto).toContain('50%');
    expect(el.querySelectorAll('progress').length).toBe(2);
    expect(el.querySelector('progress')!.value).toBe(50);
    expect(el.querySelector('a')!.getAttribute('href')).toBe('/conteudos/modulos/1');
  });

  it('erro de carga mostra alerta e nao estado vazio', async () => {
    service.modulos.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    service.progresso.mockReturnValue(of([]));
    const el = await abrir();
    expect(el.querySelector('[role=alert]')!.textContent).toContain('Não foi possível conectar');
    expect(el.textContent).not.toContain('Nenhum módulo');
  });
});
