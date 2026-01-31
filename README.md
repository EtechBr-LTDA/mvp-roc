# ROC Passaporte - MVP

Sistema completo de passaporte digital com vouchers e cupons para restaurantes da rede ROC (Rondonia Oferta Club). Inclui aplicacao do usuario, painel administrativo e API backend.

## Arquitetura do Projeto

```
mvp-roc/
├── backend/          # API NestJS (porta 3001)
├── frontend/         # App do usuario - Next.js (porta 3000)
├── admin/            # Painel administrativo - Next.js (porta 3002)
└── package.json      # Scripts globais
```

| Modulo | Tecnologia | Porta | Descricao |
|--------|-----------|-------|-----------|
| **Backend** | NestJS 11 + TypeScript | 3001 | API REST com autenticacao JWT, Supabase (PostgreSQL) |
| **Frontend** | Next.js 16 + React 19 | 3000 | App do usuario: cadastro, vouchers, validacao |
| **Admin** | Next.js 16 + React 19 | 3002 | Painel admin: dashboard, gestao de usuarios/restaurantes/vouchers |

## Inicio Rapido

### Requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Conta Supabase com projeto configurado

### Instalacao

```bash
# 1. Instalar todas as dependencias (raiz + backend + frontend + admin)
npm run install:all
cd admin && npm install

# 2. Configurar variaveis de ambiente
# Backend: backend/.env
# Frontend: frontend/.env.local
# Admin: admin/.env.local

# 3. Criar admin no banco (opcional)
cd backend && npx ts-node scripts/seed-admin.ts

# 4. Rodar tudo
npm run dev          # backend + frontend
cd admin && npm run dev  # admin (terminal separado)
```

### Variaveis de Ambiente

**Backend** (`backend/.env`):
```env
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
JWT_SECRET=sua-chave-secreta
PORT=3001
FRONTEND_URL=http://localhost:3000
ADMIN_URL=http://localhost:3002
```

**Frontend** (`frontend/.env.local`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Admin** (`admin/.env.local`):
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

## Scripts Disponiveis

### Raiz do Projeto

| Comando | Descricao |
|---------|-----------|
| `npm run dev` | Roda backend + frontend simultaneamente |
| `npm run dev:backend` | Roda apenas o backend |
| `npm run dev:frontend` | Roda apenas o frontend |
| `npm run build` | Build de backend + frontend |
| `npm run install:all` | Instala dependencias de todos os projetos |

### Por Modulo

```bash
# Backend
cd backend && npm run start:dev    # Desenvolvimento (hot reload)
cd backend && npm run build        # Build producao
cd backend && npm run start        # Producao

# Frontend
cd frontend && npm run dev         # Desenvolvimento
cd frontend && npm run build       # Build producao

# Admin
cd admin && npm run dev            # Desenvolvimento (porta 3002)
cd admin && npm run build          # Build producao
```

## Fluxos Principais

### 1. Cadastro e Onboarding do Usuario

```
Registro → Criacao de Perfil → Geracao de Pass → Geracao de 25 Vouchers
```

O usuario se cadastra com nome, CPF, email e senha. O sistema cria automaticamente um "Pass" (assinatura) e gera um voucher para cada restaurante ativo na plataforma.

### 2. Uso do Voucher

```
Usuario acessa voucher → Apresenta QR Code → Restaurante escaneia → Voucher marcado como usado
```

O voucher pode ser validado por:
- **QR Code**: Restaurante escaneia o codigo
- **Codigo manual**: Restaurante digita o codigo `ROC-XXXXX`
- **Validacao admin**: Admin valida manualmente no painel

### 3. Gestao Administrativa

```
Login admin → Dashboard com KPIs → Gerenciar usuarios/restaurantes/vouchers → Audit logs
```

O admin pode suspender usuarios, ativar/desativar restaurantes, validar vouchers manualmente e exportar dados em CSV.

## Banco de Dados (Supabase/PostgreSQL)

### Tabelas Principais

| Tabela | Descricao |
|--------|-----------|
| `profiles` | Usuarios com dados pessoais, endereco, role, status de suspensao |
| `passes` | Assinaturas dos usuarios (status: active/inactive) |
| `restaurants` | Catalogo de restaurantes parceiros |
| `vouchers` | Vouchers individuais (code, status, datas de uso/expiracao) |
| `admin_audit_logs` | Log de acoes administrativas |

### Relacionamentos

```
profiles (1) ──→ (N) passes
profiles (1) ──→ (N) vouchers
restaurants (1) ──→ (N) vouchers
profiles (1) ──→ (N) admin_audit_logs (como admin)
```

## Seguranca

- **Senhas**: Hashing com bcrypt (10 salt rounds), validacao: 8+ chars, maiuscula, minuscula, numero
- **Autenticacao**: JWT (HS256, expiracao 7 dias)
- **Rate Limiting**: 10 req/seg, 100 req/min, 1000 req/hora
- **CORS**: Restrito a origens configuradas (frontend + admin)
- **Helmet**: Headers de seguranca HTTP
- **Guards**: JWT guard + Admin guard com verificacao de role
- **CPF**: Mascara em respostas da API (`***.***.***.***-**`)
- **Audit**: Todas as acoes admin logadas com fire-and-forget

## Credenciais Admin Padrao

Apos rodar o seed script:
- **Email**: adm@roc.com.br
- **Senha**: Admin@123
- **Role**: super_admin

## Documentacao por Modulo

Cada pasta possui seu proprio README com detalhes de implementacao:

- [Backend - API REST](./backend/README.md)
- [Frontend - App do Usuario](./frontend/README.md)
- [Admin - Painel Administrativo](./admin/README.md)
