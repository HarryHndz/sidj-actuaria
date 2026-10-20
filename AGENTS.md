# AGENTS.md — sidj-actuaria_v2

## Objetivo
Contexto rápido para agentes que trabajen en este repositorio.
Proyecto: SPA de **Actuaría v3** para SIDJ (Quasar 1 + Vue 2): cédulas, notificaciones, lista de estrados, consulta de expedientes y plantillas. Se compila a assets estáticos que se despliegan dentro del backend `../tribunal-justicia-tab`.
Reglas transversales del workspace: `../AGENTS.md`. Visión general: `../documentacion/sidj-actuaria_v2.md`.

## Repositorio
- Git: `https://github.com/HarryHndz/actuaria-tribunal.git`, rama `main`.
- El último commit (`50d355c`) quitó `@tjacdmx/sidj-components` a favor de un `ModalPdf` local; el working tree tiene cambios sin commitear que la vuelven a declarar e importar. Revisa `git status` antes de tocar `TablaAnexos.vue` / `TablaDocumentos.vue`.

## Stack técnico (package.json, verificado 2026-10-20)

### Runtime y build
- `quasar ^1.22.10`, `@quasar/app 2.4.3` (webpack 4)
- `vue 2.7.16`, `vue-template-compiler 2.7.16` (deben coincidir)
- `engines`: node >= 8.9.0 (en la práctica se usa Node 24 con `--openssl-legacy-provider`, ver `../AGENTS.md`)

### Dependencias principales
- `@tjacdmx/sidj-components`: `git+https://github.com/HarryHndz/sidj-component.git#main` (fuente local en `../sidj-components-master`)
- `axios 1.13.6`
- `pdfjs-dist 2.5.207` + `vue-pdf 4.2.0` (fijadas exactas y acopladas), `print-js 1.6.0`
- `node-forge 0.10.0`
- `vuelidate 0.7.7`
- `vue-sweetalert2 5.0.5`
- `moment 2.30.1` + `vue-moment 4.1.0`, `lodash 4.17.21` + `vue-lodash 2.0.2`
- `xlsx 0.18.5`, `vue-uuid 1.1.1`, `JSON2 0.1.0`, `@quasar/extras ^1.16.15`
- `dotenv 17.3.1` (carga `.env.dev` / `.env.prod` en `quasar.conf.js`)

### DevDependencies
- `eslint 5.10.0`, `eslint-loader 2.2.1`, `eslint-plugin-vue 5.2.3`, `babel-eslint 10.0.3`, `@vue/eslint-config-airbnb 4.0.1`

## Comandos
```bash
npm install
npx quasar dev              # https://local.tjacdmx.gob.mx:8080 (certificados en ssl/)
npx quasar build            # respeta QUASAR_ENV (development por defecto)
npm run lint
npm run update-components   # npm update @tjacdmx/sidj-components
npm run deploy:dev          # QUASAR_ENV=development build + copia + actualizar-blade
npm run deploy:prod         # QUASAR_ENV=production  build + copia + actualizar-blade
```
- **No hay tests** (`npm test` es un `echo`).
- No hay CLI global de Quasar: usa `npx quasar`.

## Entorno y build
- `quasar.conf.js` lee `QUASAR_ENV` (o `NODE_ENV`), carga `.env.dev` o `.env.prod` con dotenv y expone `API_SIDJ` y `API_SCO` vía `build.env`.
- El `name` del build muta a `actuariaV3-dev` / `actuariaV3-prod` → `distDir: dist/<name>`, `publicPath: apps/sidj-app-v001/<name>`.
- `.env.*` no se versionan.

## Despliegue
`deploy:dev|prod` copian `dist/actuariaV3-<env>/*` a `../tribunal-justicia-tab/public/apps/sidj-app-v001/actuariaV3-<env>/` y ejecutan `node scripts/actualizar-blade.js <env>`.
El Blade `../tribunal-justicia-tab/resources/views/apps/act_actuariav3.blade.php` es **compartido por dev y prod** (`@if APP_ENV`): el script no lo sobrescribe, solo reemplaza los hashes JS/CSS del entorno construido y falla si no actualizó ningún JS.
Los scripts son POSIX: en Windows requieren `script-shell` de npm apuntando a Git Bash (ver `../AGENTS.md`).

## Estructura src/
```
src/
├── boot/        # sidjbridge.js (API SIDJ), scobridge.js (citas SCO), appConfig, env (VERSION_* y DATE_CACHE_LIMIT),
│                # errors, validaciones, infoFile, moment, lodash, print-js, vuelidate, vue-pdf, sweetalert2, vue-uuid
│                # (veeValidate.js existe pero NO está registrado en quasar.conf.js)
├── pages/       # GeneracionCedulas/, Notificaciones/, NotificacionesComparecencia/, ListaEstrados/,
│                # ExpedienteConsulta/, GrupoPlantillas/, AdminTiposLeyendas.vue, BusquedaCitasSco.vue + comunes
├── components/  # misma división por módulo + Generales/ (ModalPdf, etc.)
├── layouts/, router/ (guard global con meta.requiresAuth)
└── store/       # ~82 módulos Vuex (index/state/getters/mutations/actions.js) + utlils/ (merge por id)
manualtex/ActuariaV3   # manual de usuario en LaTeX
scripts/actualizar-blade.js
```

## Integración con el backend
- `sidjbridge`: DEV `baseURL = API_SIDJ` y token Bearer de `localStorage`; PROD `<host>/api/` + `X-CSRF-TOKEN` del meta que inyecta Blade (`index.template.html` lleva `{{ csrf_token() }}`).
- `scobridge`: `API_SCO`.
- La URL del API **no** está en `src/boot/env.js`; ese archivo solo tiene versiones por módulo y `DATE_CACHE_LIMIT` (fecha para invalidar caché en `localStorage`).

## Convenciones
- Carga de datos en el hook `preFetch` de cada página (`preFetch: true`).
- Errores de axios → `boot/errors.js`.
- ESLint corre como pre-loader de webpack: **un error de lint rompe el build**.
- Al cambiar un módulo funcional, sube su `VERSION_*` en `src/boot/env.js`.
- Código y textos en español; 2 espacios, LF.

## Advertencias para agentes
- `vue-pdf 4.2.0` y `pdfjs-dist 2.5.207` fijadas exactas — no actualizar sin probar render de PDFs.
- Validación con vuelidate; VeeValidate no está activo.
- `@tjacdmx/sidj-components` se trae de `main` sin versionar: un push allí cambia esta SPA en el próximo `npm install`.
- Quasar 1.x / Vue 2.7 — no compatible con Quasar 2 / Vue 3 sin migración.

## Checklist antes de cerrar cambios
- `npm run lint` y `npx quasar build` sin errores.
- PDFs renderizan e imprimen; cédulas y listados se generan.
- Si se desplegó: `actualizar-blade.js` reportó los JS actualizados del entorno correcto.
