import { environment } from './environment';

describe('environment de producao', () => {
  it('aponta apiUrl para uma URL https', () => {
    expect(environment.apiUrl.startsWith('https://')).toBe(true);
  });
});
