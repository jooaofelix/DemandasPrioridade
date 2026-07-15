# Publicar no Cloudflare Pages

## Build de produção

```bash
npm install
npm run build
```

Isso gera a pasta `dist/` com o app estático (inclui `manifest.webmanifest`,
service worker e o arquivo `_redirects` necessário para o roteamento de SPA).

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

```bash
npm install -g wrangler
wrangler login
wrangler pages deploy dist --project-name=agora
```

## Domínio customizado

Em **Workers & Pages → seu projeto → Custom domains**, adicione seu domínio
e siga as instruções de DNS. Lembre-se de adicionar esse domínio também nos
"Authorized domains" do Firebase Authentication.

## Cache do Service Worker após deploy

O `vite-plugin-pwa` está configurado com `registerType: "autoUpdate"`: novas
versões são baixadas em segundo plano e ativadas na próxima navegação, sem
exigir que o usuário desinstale o app.
