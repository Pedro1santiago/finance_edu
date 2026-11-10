import { HttpErrorResponse } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Observable, Subject, of, throwError } from 'rxjs';
import { Meta, MetaService } from './meta.service';
import { Metas } from './metas';

registerLocaleData(localePt);

const meta = (extra: Partial<Meta> = {}): Meta => ({
  id: 1,
  nome: 'Viagem',
  valorAlvo: 5000,
  prazo: '2030-01-01',
  criadaEm: '2026-11-02',
  totalEconomizado: 1000,
  valorRestante: 4000,
  percentualAtingido: 20,
  status: 'ATIVA',
  estimativaConclusao: null,
  ...extra,
});

describe('Metas', () => {
  const service = { listar: vi.fn(), criar: vi.fn(), alterar: vi.fn(), excluir: vi.fn() };

  const botao = (el: HTMLElement, texto: string) => [...el.querySelectorAll('button')].find((b) => b.textContent?.includes(texto))!;

  const montar = async (lista: Meta[], retorno: Observable<Meta[]> = of(lista)) => {
    Object.values(service).forEach((f) => f.mockReset());
    service.listar.mockReturnValue(retorno);
    await TestBed.configureTestingModule({
      imports: [Metas],
      providers: [provideRouter([]), { provide: LOCALE_ID, useValue: 'pt-BR' }, { provide: MetaService, useValue: service }],
    }).compileComponents();
    const fixture = TestBed.createComponent(Metas);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;
    const atualizar = async () => {
      await fixture.whenStable();
      fixture.detectChanges();
      await fixture.whenStable();
    };
    await atualizar();
    return { el, atualizar };
  };

  it('lista metas com nome, percentual, status e valores', async () => {
    const { el } = await montar([meta()]);
    const texto = el.textContent!.replaceAll(' ', ' ');
    expect(texto).toContain('Viagem');
    expect(texto).toContain('20%');
    expect(texto).toContain('ATIVA');
    expect(texto).toContain('R$ 1.000,00');
    expect(texto).toContain('R$ 5.000,00');
    const barra = el.querySelector('.goal-progress')!;
    expect(barra.getAttribute('aria-valuenow')).toBe('20');
    expect(barra.querySelector('i')!.style.width).toBe('20%');
  });

  it('resumo soma o economizado e conta metas ativas e concluidas', async () => {
    const { el } = await montar([
      meta({ id: 1, totalEconomizado: 1000 }),
      meta({ id: 2, totalEconomizado: 500, status: 'CONCLUIDA' }),
      meta({ id: 3, totalEconomizado: 250.5 }),
    ]);
    const resumo = el.querySelector('.goal-summary')!.textContent!.replace(/\s/g, ' ');
    expect(resumo).toContain('R$ 1.750,50');
    expect(el.querySelector('.goal-summary [data-ativas]')!.textContent).toBe('2');
    expect(el.querySelector('.goal-summary [data-concluidas]')!.textContent).toBe('1');
  });

  describe('modal', () => {
    it('Nova meta abre o dialogo com foco no primeiro campo', async () => {
      const { el, atualizar } = await montar([]);
      expect(el.querySelector('.modal')).toBeNull();
      botao(el, 'Nova meta').click();
      await atualizar();
      expect(el.querySelector('.modal-backdrop .modal[role=dialog]')).not.toBeNull();
      expect(document.activeElement).toBe(el.querySelector('input[name=nome]'));
    });

    it('botao fechar fecha o dialogo', async () => {
      const { el, atualizar } = await montar([]);
      botao(el, 'Nova meta').click();
      await atualizar();
      el.querySelector<HTMLButtonElement>('.modal-close')!.click();
      await atualizar();
      expect(el.querySelector('.modal')).toBeNull();
    });

    const abrir = async (el: HTMLElement, atualizar: () => Promise<void>, texto: string) => {
      const gatilho = botao(el, texto);
      gatilho.focus();
      gatilho.click();
      await atualizar();
      return gatilho;
    };
    const tab = (shiftKey: boolean) => document.activeElement!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey, bubbles: true, cancelable: true }));

    it.each([
      ['botao fechar', (el: HTMLElement) => el.querySelector<HTMLButtonElement>('.modal-close')!.click()],
      ['Cancelar', (el: HTMLElement) => botao(el, 'Cancelar').click()],
      ['Esc', () => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))],
    ])('fechar por %s devolve o foco a Nova meta', async (_, fechar) => {
      const { el, atualizar } = await montar([]);
      const gatilho = await abrir(el, atualizar, 'Nova meta');
      fechar(el);
      await atualizar();
      expect(el.querySelector('.modal')).toBeNull();
      expect(document.activeElement).toBe(gatilho);
    });

    it('fechar a edicao devolve o foco ao botao Editar', async () => {
      const { el, atualizar } = await montar([meta({ id: 3 })]);
      const gatilho = await abrir(el, atualizar, 'Editar');
      el.querySelector<HTMLButtonElement>('.modal-close')!.click();
      await atualizar();
      expect(document.activeElement).toBe(gatilho);
    });

    it('Tab no ultimo campo volta ao primeiro e Shift+Tab no primeiro vai ao ultimo', async () => {
      const { el, atualizar } = await montar([]);
      await abrir(el, atualizar, 'Nova meta');
      const campos = [...el.querySelectorAll<HTMLElement>('.modal button, .modal input')];
      campos.at(-1)!.focus();
      tab(false);
      expect(document.activeElement).toBe(campos[0]);
      tab(true);
      expect(document.activeElement).toBe(campos.at(-1));
    });

    it('Esc fecha o dialogo', async () => {
      const { el, atualizar } = await montar([]);
      botao(el, 'Nova meta').click();
      await atualizar();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await atualizar();
      expect(el.querySelector('.modal')).toBeNull();
    });
  });

  it('percentual usa formato pt-BR', async () => {
    const { el } = await montar([meta({ percentualAtingido: 46.25 })]);
    expect(el.textContent).toContain('46,25%');
  });

  it('enquanto carrega mostra Carregando e nao o estado vazio', async () => {
    const { el } = await montar([], new Subject<Meta[]>());
    expect(el.textContent).toContain('Carregando…');
    expect(el.textContent).not.toContain('Nenhuma meta');
  });

  it('sem metas mostra estado vazio', async () => {
    const { el } = await montar([]);
    expect(el.textContent).toContain('Nenhuma meta');
  });

  it('editar preenche o form, salva com alterar(id, dados) e recarrega', async () => {
    const { el, atualizar } = await montar([meta({ id: 3, prazo: '2099-01-01' })]);
    service.alterar.mockReturnValue(of(meta()));
    el.querySelector<HTMLButtonElement>('article button')!.click();
    await atualizar();
    const form = el.querySelector('.modal form')!;
    const nome = form.querySelector<HTMLInputElement>('input[name=nome]')!;
    expect(nome.value).toBe('Viagem');
    expect(form.querySelector<HTMLInputElement>('input[name=prazo]')!.value).toBe('2099-01-01');
    nome.value = 'Casa';
    nome.dispatchEvent(new Event('input'));
    form.dispatchEvent(new Event('submit'));
    await atualizar();
    expect(service.alterar).toHaveBeenCalledWith(3, { nome: 'Casa', valorAlvo: 5000, prazo: '2099-01-01' });
    expect(service.listar).toHaveBeenCalledTimes(2);
    expect(el.querySelector('.modal')).toBeNull();
  });

  it('falha ao listar mostra o erro em vez do estado vazio', async () => {
    const { el } = await montar([], throwError(() => new HttpErrorResponse({ status: 500 })));
    expect(el.textContent).toContain('Erro no servidor, tente novamente');
    expect(el.textContent).not.toContain('Nenhuma meta');
  });

  it('falha ao excluir mostra o erro', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const { el, atualizar } = await montar([meta({ id: 3 })]);
    service.excluir.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 422, error: { detail: 'nao pode' } })));
    el.querySelector<HTMLButtonElement>('article button.excluir')!.click();
    await atualizar();
    expect(el.textContent).toContain('nao pode');
  });

  describe('excluir', () => {
    const clicar = async (confirmar: boolean) => {
      vi.spyOn(window, 'confirm').mockReturnValue(confirmar);
      const { el, atualizar } = await montar([meta({ id: 3 })]);
      service.excluir.mockReturnValue(of(undefined));
      el.querySelector<HTMLButtonElement>('article button.excluir')!.click();
      await atualizar();
    };

    it('cancelar nao chama excluir', async () => {
      await clicar(false);
      expect(service.excluir).not.toHaveBeenCalled();
    });

    it('confirmar chama excluir e recarrega', async () => {
      await clicar(true);
      expect(service.excluir).toHaveBeenCalledWith(3);
      expect(service.listar).toHaveBeenCalledTimes(2);
    });
  });

  describe('criar', () => {
    const preencher = (el: HTMLElement, valores: Record<string, string>) => {
      for (const [nome, valor] of Object.entries(valores)) {
        const i = el.querySelector<HTMLInputElement>(`input[name=${nome}]`)!;
        i.value = valor;
        i.dispatchEvent(new Event('input'));
      }
    };
    const enviar = async (el: HTMLElement, atualizar: () => Promise<void>) => {
      el.querySelector('form')!.dispatchEvent(new Event('submit'));
      await atualizar();
    };
    const montarAberto = async () => {
      const r = await montar([]);
      botao(r.el, 'Nova meta').click();
      await r.atualizar();
      return r;
    };
    const valido = { nome: 'Viagem', valorAlvo: '5000', prazo: '2099-01-01' };
    const erro422 = (detail: string) => new HttpErrorResponse({ status: 422, error: { detail } });

    it('valido chama criar e recarrega a lista', async () => {
      const { el, atualizar } = await montarAberto();
      service.criar.mockReturnValue(of(meta()));
      preencher(el, valido);
      await enviar(el, atualizar);
      expect(service.criar).toHaveBeenCalledWith({ nome: 'Viagem', valorAlvo: 5000, prazo: '2099-01-01' });
      expect(service.listar).toHaveBeenCalledTimes(2);
    });

    it.each([
      ['prazo passado', { ...valido, prazo: '2000-01-01' }],
      ['valor zero', { ...valido, valorAlvo: '0' }],
      ['nome vazio', { ...valido, nome: '' }],
      ['nome so espacos', { ...valido, nome: '   ' }],
    ])('invalido (%s) nao chama e limpa o erro anterior', async (_, valores) => {
      const { el, atualizar } = await montarAberto();
      service.criar.mockReturnValue(throwError(() => erro422('falhou')));
      preencher(el, valido);
      await enviar(el, atualizar);
      expect(el.textContent).toContain('falhou');
      service.criar.mockClear();
      preencher(el, valores);
      await enviar(el, atualizar);
      expect(service.criar).not.toHaveBeenCalled();
      expect(el.textContent).not.toContain('falhou');
    });

    it('desabilita o botao em voo e envia uma vez so', async () => {
      const { el, atualizar } = await montarAberto();
      service.criar.mockReturnValue(new Subject());
      preencher(el, valido);
      await enviar(el, atualizar);
      await enviar(el, atualizar);
      expect(service.criar).toHaveBeenCalledTimes(1);
      expect(el.querySelector<HTMLButtonElement>('form button[type=submit]')!.disabled).toBe(true);
    });

    it('422 mostra o detail', async () => {
      const { el, atualizar } = await montarAberto();
      service.criar.mockReturnValue(throwError(() => erro422('Prazo no passado')));
      preencher(el, valido);
      await enviar(el, atualizar);
      expect(el.textContent).toContain('Prazo no passado');
    });
  });
});
