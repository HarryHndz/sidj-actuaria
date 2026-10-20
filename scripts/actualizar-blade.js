/* eslint-disable no-console */
// Actualiza los hashes de JS/CSS del entorno indicado en el blade de tribunal-justicia-tab.
// El blade es compartido por dev y prod (switch con @if APP_ENV), por eso no se sobrescribe
// con el index.html del build: solo se reemplazan las rutas del entorno que se construyó.
// Uso: node scripts/actualizar-blade.js dev|prod

const fs = require('fs');
const path = require('path');

const env = process.argv[2];
if (!['dev', 'prod'].includes(env)) {
  console.error('Uso: node scripts/actualizar-blade.js dev|prod');
  process.exit(1);
}

const app = `actuariaV3-${env}`;
const indexPath = path.join(__dirname, '..', 'dist', app, 'index.html');
const bladePath = path.join(__dirname, '..', '..', 'tribunal-justicia-tab', 'resources', 'views', 'apps', 'act_actuariav3.blade.php');

const index = fs.readFileSync(indexPath, 'utf8');
let blade = fs.readFileSync(bladePath, 'utf8');

const assetRegex = new RegExp(`/apps/sidj-app-v001/${app}/(js|css)/([\\w-]+)\\.[0-9a-f]+\\.(js|css)`, 'g');
const assets = index.match(assetRegex) || [];
let jsActualizados = 0;

assets.forEach((nuevo) => {
  const [, dir, nombre, ext] = nuevo.match(new RegExp(assetRegex.source));
  const anterior = new RegExp(`/apps/sidj-app-v001/${app}/${dir}/${nombre}\\.[0-9a-f]+\\.${ext}`, 'g');
  if (!anterior.test(blade)) {
    console.warn(`Aviso: el blade no referencia ${dir}/${nombre}.*.${ext} de ${app}, se omite`);
    return;
  }
  blade = blade.replace(anterior, nuevo);
  if (ext === 'js') jsActualizados += 1;
  console.log(`Actualizado: ${nuevo}`);
});

if (jsActualizados === 0) {
  console.error(`No se actualizó ningún JS de ${app} en el blade, revisa ${bladePath}`);
  process.exit(1);
}

fs.writeFileSync(bladePath, blade);
console.log('Blade actualizado');
