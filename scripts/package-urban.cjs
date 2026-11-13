'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const {createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
const destination=path.resolve(process.argv[2]||path.join(root,'artifacts/urban-spike'));
const stage=path.join(destination,'package');
fs.mkdirSync(stage,{recursive:true});
const html=fs.readFileSync(path.join(root,'urban-spike/index.html'),'utf8');
const css=fs.readFileSync(path.join(root,'urban-spike/styles.css'),'utf8');
const js=fs.readFileSync(path.join(root,'urban-spike/demo.js'),'utf8').replace(/<\/script/gi,'<\\/script');
const standalone=html.replace(/<link rel="stylesheet" href="styles.css">/,()=>`<style>${css}</style>`)
  .replace(/<script src="\.\/demo.js" defer><\/script>/,()=>`<script defer>${js}</script>`);
// Inline scripts cannot be deferred; keep initialization after its DOM.
const script=standalone.match(/<script defer>[\s\S]*?<\/script>/)[0];
const complete=standalone.replace(script,'').replace('</body>',()=>script.replace('<script defer>','<script>')+'\n</body>');
fs.mkdirSync(path.join(stage,'urban-spike'),{recursive:true});
fs.writeFileSync(path.join(stage,'urban-spike/index.html'),complete);
fs.copyFileSync(path.join(root,'urban-spike/vendor/THREE-LICENSE.txt'),path.join(stage,'urban-spike/THREE-LICENSE.txt'));
for(const file of ['index.html','styles.css','src/simulation.js','src/game.js','data/world-data.js']){
  fs.mkdirSync(path.dirname(path.join(stage,file)),{recursive:true});fs.copyFileSync(path.join(root,file),path.join(stage,file));
}
fs.writeFileSync(path.join(stage,'LEIA-ME.txt'),`CRISIS VECTOR — prova urbana isolada\n\nAbrir urban-spike/index.html num navegador desktop recente com WebGL 2.\nO ficheiro inclui Three.js, código e estilos locais; não consulta CDNs ou APIs.\nSe o navegador bloquear file://, executar na pasta extraída:\n  python3 -m http.server 8000\nE abrir http://127.0.0.1:8000/urban-spike/\n\nSelecionar Alfa/Bravo, escolher uma ordem e clicar numa rua. Arrastar move a câmara; roda amplia; Espaço pausa; teclas 1/2 selecionam; R recentra.\nPreparar ambos os acessos orientais antes das vagas. Evacuar 90/120 civis em 210 segundos.\nValores sintéticos, sem integração na campanha. Three.js tem licença MIT incluída.\n`);
const files=['LEIA-ME.txt','index.html','styles.css','src/simulation.js','src/game.js','data/world-data.js','urban-spike/index.html','urban-spike/THREE-LICENSE.txt'];
// Stable archive metadata; build time is not an input to the playable artifact.
for(const file of files)fs.utimesSync(path.join(stage,file),new Date('2026-11-13T00:00:00Z'),new Date('2026-11-13T00:00:00Z'));
const zip=path.join(destination,'crisis-vector-urban-spike.zip');
if(fs.existsSync(zip))fs.unlinkSync(zip);
execFileSync('zip',['-X','-q',zip,...files],{cwd:stage});
fs.copyFileSync(path.join(stage,'urban-spike/index.html'),path.join(destination,'urban-demo.html'));
const checksum=file=>createHash('sha256').update(fs.readFileSync(file)).digest('hex');
fs.writeFileSync(path.join(destination,'SHA256SUMS.txt'),`${checksum(zip)}  crisis-vector-urban-spike.zip\n${checksum(path.join(destination,'urban-demo.html'))}  urban-demo.html\n`);
console.log(JSON.stringify({zip,standalone:path.join(destination,'urban-demo.html'),sha256:checksum(zip)}));
