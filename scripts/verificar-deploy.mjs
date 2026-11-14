// Checagens estaticas dos artefatos de deploy. Uso: node scripts/verificar-deploy.mjs
import { readFileSync } from 'node:fs';

const ler = (caminho) => readFileSync(new URL(`../${caminho}`, import.meta.url), 'utf8');
const erros = [];
const checar = (ok, msg) => ok || erros.push(msg);

// render.yaml: checagem por linha (shortcut: assume o formato "- key:" seguido de sync/generateValue; trocar por parser se o blueprint crescer)
const blocos = ler('render.yaml').split(/^\s*- key:/m).slice(1);
checar(blocos.length > 0, 'render.yaml sem envVars');
const naoSecretas = ['CORS_ORIGENS'];
for (const bloco of blocos) {
  const chave = bloco.split('\n')[0].trim();
  if (naoSecretas.includes(chave)) continue;
  checar(/^\s*sync:\s*false\s*$/m.test(bloco) || /^\s*generateValue:\s*true\s*$/m.test(bloco), `render.yaml: ${chave} precisa de sync: false ou generateValue`);
  checar(!/^\s*value:/m.test(bloco), `render.yaml: ${chave} tem valor fixo`);
}

// vercel.json: outputDirectory deve ser dist/<projeto>/browser (padrao do Angular)
const vercel = JSON.parse(ler('frontend/vercel.json'));
const projeto = Object.keys(JSON.parse(ler('frontend/angular.json')).projects)[0];
checar(vercel.outputDirectory === `dist/${projeto}/browser`, `vercel.json: outputDirectory deveria ser dist/${projeto}/browser`);
checar(vercel.rewrites?.some((r) => r.destination === '/index.html'), 'vercel.json: falta rewrite para /index.html');

// Dockerfile: jar igual a artifactId-version do pom
const pom = ler('backend/pom.xml').replace(/<parent>[\s\S]*?<\/parent>/, '');
const jar = `${pom.match(/<artifactId>(.*?)<\/artifactId>/)[1]}-${pom.match(/<version>(.*?)<\/version>/)[1]}.jar`;
checar(ler('Dockerfile').includes(`/app/target/${jar}`), `Dockerfile: jar esperado ${jar}`);

// environment de producao
checar(/apiUrl:\s*'https:\/\//.test(ler('frontend/src/environments/environment.ts')), 'environment.ts: apiUrl precisa comecar com https://');

// README
const readme = ler('README.md');
for (const termo of ['Rodar local', 'Supabase', 'Render', 'Vercel', 'DB_URL', 'DB_USER', 'DB_PASSWORD', 'JWT_SECRET', 'CORS_ORIGENS']) {
  checar(readme.includes(termo), `README.md: falta "${termo}"`);
}

if (erros.length) {
  console.error(erros.join('\n'));
  process.exit(1);
}
console.log('deploy ok');
