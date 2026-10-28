// Copia os arquivos do site para www/ (pasta que o Capacitor empacota no APK).
// A raiz do repositório continua sendo o que o GitHub Pages publica.
import { cpSync, mkdirSync, rmSync } from 'node:fs';

rmSync('www', { recursive: true, force: true });
mkdirSync('www', { recursive: true });

for (const f of ['index.html', 'manifest.webmanifest', 'sw.js']) {
  cpSync(f, `www/${f}`);
}
cpSync('assets', 'www/assets', { recursive: true });

console.log('www/ pronto para o Capacitor ✔');
