---
name: verify
description: Como buildar, subir e dirigir o Up4Life (front React/Vite + back NestJS irmão) para verificar mudanças end-to-end no navegador.
---

# Verificação end-to-end do Up4Life

## Subir o ambiente

- Backend (repo irmão): `cd ../up4-life && npm run start:dev` — porta 3000, banco Supabase remoto via `DATABASE_URL` no `.env`. Aguardar "Nest application successfully started" no log. Atenção: a porta 3000 pode já estar ocupada por uma instância antiga (`node dist/src/main.js`) com código velho — checar `ss -tlnp | grep :3000` antes.
- Frontend: `npm run dev` (Vite). CORS do backend só permite portas **5173/5174** — se o Vite subir em 5175+, derrubar instâncias antigas ou nada de API funciona.
- Latência: o Supabase (sa-east-1 via pooler) às vezes leva >30s numa requisição fria; timeouts isolados de curl não indicam bug.

## Login de teste (seed)

Personal do seed (`../up4-life/prisma/seed.ts`): telefone `65999999999`, senha `123456`. Na tela de login, clicar no botão "Personal" antes de submeter.

## Dirigir no navegador

Sem Playwright no repo; usar `playwright-core` (instalar no scratchpad) + Chrome do sistema:

```js
import { chromium } from 'playwright-core'
const browser = await chromium.launch({ executablePath: '/usr/bin/google-chrome', headless: true })
```

Seletores estáveis: `getByPlaceholder('(65) 99999-9999')`, `getByPlaceholder('Digite sua senha')`, botão `Entrar na plataforma`. Rotas: `/dashboard/admin/perfil`, `/dashboard/admin/treinos`, `/dashboard/admin/avaliacoes(/nova)`.

## Gotchas

- `prisma migrate dev` **trava** contra o Supabase (shadow database). Fluxo do projeto: escrever a migration à mão em `prisma/migrations/<timestamp>_<nome>/migration.sql` e aplicar com `npx prisma migrate deploy`; SQL avulso com `npx prisma db execute --stdin`.
- Avaliações não têm endpoint DELETE — limpar dados de teste via SQL direto.
- `categoria` do treino não persiste no backend (o DTO não a aceita); após recarregar, treinos vêm sem categoria — pré-existente, não é regressão.
