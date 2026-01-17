# ROC Passaporte - MVP

Sistema de passaporte com cupons e vouchers para restaurantes.

## 🏗️ Estrutura do Projeto

```
mvp-roc/
├── backend/          # NestJS API (porta 3001)
├── frontend/         # Next.js App (porta 3000)
└── package.json      # Scripts para rodar ambos
```

## 🚀 Início Rápido

### Opção 1: Usando npm scripts (Recomendado)

```bash
# 1. Instalar dependências (raiz, backend e frontend)
npm run install:all

# 2. Rodar backend e frontend simultaneamente
npm run dev
```

**Ou individualmente:**

```bash
# Terminal 1 - Backend
npm run dev:backend
# ou
cd backend && npm run start:dev

# Terminal 2 - Frontend
npm run dev:frontend
# ou
cd frontend && npm run dev
```

### Opção 2: Usando scripts (Windows)

```powershell
# PowerShell
.\dev.ps1
```

### Opção 3: Usando scripts (Linux/Mac)

```bash
# Bash
chmod +x dev.sh
./dev.sh
```

## 📋 Scripts Disponíveis

### Scripts na Raiz

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Roda backend e frontend simultaneamente |
| `npm run dev:backend` | Roda apenas o backend |
| `npm run dev:frontend` | Roda apenas o frontend |
| `npm run build` | Builda backend e frontend |
| `npm run start` | Roda backend e frontend em modo produção |
| `npm run install:all` | Instala dependências de todos os projetos |
| `npm run lint` | Executa lint em ambos os projetos |

### Backend (NestJS)

| Comando | Descrição |
|---------|-----------|
| `cd backend && npm run start:dev` | Roda em modo desenvolvimento (watch) |
| `cd backend && npm run build` | Compila o projeto |
| `cd backend && npm run start` | Roda em modo produção |

### Frontend (Next.js)

| Comando | Descrição |
|---------|-----------|
| `cd frontend && npm run dev` | Roda em modo desenvolvimento |
| `cd frontend && npm run build` | Compila para produção |
| `cd frontend && npm run start` | Roda em modo produção |

## 🌐 URLs

Após iniciar os servidores:

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 📦 Dependências

### Raiz
- `concurrently` - Para rodar múltiplos comandos simultaneamente

### Backend
- NestJS 11
- TypeScript 5.6
- Express

### Frontend
- Next.js 16.1.2
- React 19.2.3
- TailwindCSS 4
- Supabase Client

## 🔧 Configuração

### Variáveis de Ambiente

**Frontend** (`.env.local`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_key
```

**Backend** (`.env` - opcional):
```env
FRONTEND_URL=http://localhost:3000
PORT=3001
```

## 🛠️ Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0

## 📝 Notas

- Backend e frontend estão conectados via HTTP (CORS habilitado)

