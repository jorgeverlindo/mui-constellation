# Constellation Full App

Monorepo do Constellation Design System em MUI:

- **`packages/ux`** — `@jorgeverlindo/constellation-ux`: biblioteca MUI pura (theme + tokens + componentes), publicável via GitHub Packages (repo privado `jorgeverlindo/constellation-ux`).
- **`apps/`** — réplica do app vw-funds-2 consumindo a biblioteca (Fase 3).

## Fontes da verdade

- **Visual:** Figma "❖ AV3 Constellation Design System - Component Library"
- **Comportamento:** app original `vw-funds-2` (somente leitura — não modificar)

## Comandos

```bash
npm install        # instala o workspace inteiro
npm run build:ux   # builda a biblioteca (tsup: ESM + CJS + d.ts)
npm run typecheck  # typecheck de todos os workspaces
```

## Notas

- A biblioteca não embute fontes: o app host carrega Inter (ex.: `@fontsource/inter`).
- Theme augmentation expõe `palette.brand`, `palette.rail`, `palette.ink` e `palette.surface` tipados.
- Publicação (Fase 4): `publishConfig` já aponta para `npm.pkg.github.com`; falta criar o repo privado e o token/CI.
