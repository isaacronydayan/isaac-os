# Isaac OS

Personal Life Dashboard — Google Calendar + WHOOP + Vercel

## Deploy em 5 minutos

### 1. GitHub
1. Acesse https://github.com/new
2. Crie um repositório chamado `isaac-os` (privado ou público)
3. Faça upload de todos os arquivos deste projeto

### 2. Vercel
1. Acesse https://vercel.com e faça login com GitHub
2. Clique em "Add New Project"
3. Importe o repositório `isaac-os`
4. Em "Environment Variables", adicione:
   - `WHOOP_CLIENT_ID` = (seu Client ID da WHOOP)
   - `WHOOP_CLIENT_SECRET` = (seu Client Secret da WHOOP)
   - `WHOOP_REDIRECT_URI` = `https://SEU-PROJETO.vercel.app/callback`
5. Clique em Deploy

### 3. URLs para configurar na WHOOP Developer Console
- Privacy Policy URL: `https://SEU-PROJETO.vercel.app/privacy`
- Redirect URL: `https://SEU-PROJETO.vercel.app/callback`

## Estrutura do projeto
```
isaac-os/
├── api/
│   ├── index.js          # App principal (SPA)
│   ├── privacy.js        # Política de privacidade
│   ├── callback.js       # OAuth callback WHOOP
│   ├── whoop-login.js    # Inicia fluxo OAuth
│   └── whoop-data.js     # Proxy de dados WHOOP
├── vercel.json           # Roteamento
└── package.json
```
