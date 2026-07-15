# Publicar no Cloudflare Pages

## Build de produção

```bash
npm install
npm run build
```

Isso gera a pasta `dist/` com o app estático (inclui `manifest.webmanifest`
e o service worker). O roteamento de SPA é resolvido pela configuração
`assets.not_found_handling: "single-page-application"` em `wrangler.jsonc`
— não use um arquivo `_redirects` com uma regra `/* /index.html 200`, pois
isso conflita com o modo `single-page-application` do Cloudflare e gera o
erro "Infinite loop detected in this rule" no deploy.

## Opção A — Dashboard do Cloudflare (mais simples)

1. Acesse https://dash.cloudflare.com → **Workers & Pages → Create → Pages
   → Connect to Git**, e selecione este repositório.
2. Configurações de build:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
3. Em **Environment variables**, adicione as mesmas variáveis do seu
   `.env.local` (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, etc.)
   — elas precisam existir também em tempo de build, pois o Vite as injeta
   estaticamente no bundle.
4. Deploy. O Cloudflare Pages te dará uma URL `*.pages.dev`.
5. Volte ao console do Firebase (**Authentication → Settings → Authorized
   domains**) e adicione esse domínio (e o seu domínio customizado, se
   houver), senão o login com Google será bloqueado.

## Opção B — CLI (`wrangler`)

Este repositório inclui um `wrangler.jsonc` configurado para publicar `dist/`
como assets estáticos (com fallback de SPA nativo, sem precisar de
`_redirects`):

```bash
npm install -g wrangler
wrangler login
npm run build
wrangler deploy
```

## Domínio customizado

Em **Workers & Pages → seu projeto → Custom domains**, adicione seu domínio
e siga as instruções de DNS. Lembre-se de adicionar esse domínio também nos
"Authorized domains" do Firebase Authentication.

## Cache do Service Worker após deploy

O `vite-plugin-pwa` está configurado com `registerType: "autoUpdate"`: novas
versões são baixadas em segundo plano e ativadas na próxima navegação, sem
exigir que o usuário desinstale o app.
