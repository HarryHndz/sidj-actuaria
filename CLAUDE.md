# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Contexto del workspace

- Reglas comunes a todos los proyectos: `../AGENTS.md`. Visión general de este proyecto: `../documentacion/sidj-actuaria_v2.md`.
- La SPA mejor documentada del workspace es `../sidj-oficialia-partes/CLAUDE.md`; sus secciones de bridges, Vuex y `preFetch` aplican casi igual aquí.
- Repo git propio: haz commits dentro de esta carpeta, nunca en la raíz del workspace.

## Comandos y entorno (Windows)

- No hay CLI global de Quasar: usa `npx quasar dev` / `npx quasar build`.
- **No hay tests**: `npm test` es un `echo`. Verifica con `npm run lint` y `npx quasar build`; no inventes comandos de test.
- Node v24 + webpack 4: sin `--openssl-legacy-provider` el build muere al ~93 % (fase gzip) con `error:0308010C:digital envelope routines::unsupported`. Ya está configurado en la config **global** de npm (`node-options`); si reaparece, revisa `npm config get node-options`.
- Los scripts `deploy*` usan sintaxis POSIX; npm está configurado globalmente con `script-shell = C:\Program Files\Git\bin\bash.exe` (no el `bash` de WSL). **No ejecutes `deploy*` sin que el usuario lo pida**: sobrescribe bundles y vistas Blade en `../tribunal-justicia-tab`, que es un repo git activo.
