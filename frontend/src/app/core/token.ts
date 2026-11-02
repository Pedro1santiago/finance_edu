const CHAVE = 'financeedu.token';

export const lerToken = () => localStorage.getItem(CHAVE);
export const gravarToken = (token: string) => localStorage.setItem(CHAVE, token);
export const removerToken = () => localStorage.removeItem(CHAVE);
