# Frontend - App do Usuario

Aplicacao Next.js 16 para os usuarios do ROC Passaporte. Permite cadastro, login, visualizacao de vouchers, validacao e gerenciamento de conta.

## Estrutura

```
frontend/
├── app/
│   ├── auth/                        # Paginas de autenticacao
│   │   ├── login/page.tsx           # Login do usuario
│   │   ├── register/page.tsx        # Cadastro
│   │   ├── forgot-password/page.tsx # Esqueci minha senha
│   │   └── reset-password/page.tsx  # Redefinir senha (com token)
│   ├── account/                     # Area do usuario logado
│   │   ├── profile/page.tsx         # Perfil e dados pessoais
│   │   ├── payment/page.tsx         # Pagamento e assinatura
│   │   ├── support/page.tsx         # Suporte ao cliente
│   │   └── vouchers/
│   │       ├── page.tsx             # Lista de vouchers
│   │       └── [id]/page.tsx        # Detalhe do voucher (QR code)
│   ├── api/                         # API Routes (proxy)
│   │   └── vouchers/
│   │       ├── route.ts             # CRUD vouchers
│   │       ├── [id]/route.ts        # Voucher individual
│   │       └── validate/
│   │           ├── route.ts         # Validar voucher
│   │           └── check/route.ts   # Verificar voucher
│   ├── benefits/page.tsx            # Pagina de beneficios
│   ├── checkout/
│   │   ├── page.tsx                 # Checkout da assinatura
│   │   └── success/page.tsx         # Confirmacao de pagamento
│   ├── validate/page.tsx            # Validacao de voucher (lojista)
│   ├── components/                  # Componentes reutilizaveis
│   ├── lib/                         # Utilitarios e clientes
│   ├── layout.tsx                   # Layout raiz
│   ├── page.tsx                     # Landing page
│   └── globals.css                  # Estilos globais
└── public/                          # Assets estaticos
```

## Paginas

### Landing Page (`/`)

Pagina de marketing com:
- Hero section com proposta de valor
- Secao "O que voce recebe" com beneficios
- "Como funciona" em 3 passos
- Carousel de restaurantes parceiros
- FAQ com 6 perguntas frequentes
- CTA final para conversao
- Footer com redes sociais e informacoes legais

### Autenticacao (`/auth/*`)

**Login** (`/auth/login`):
- Formulario email + senha
- Opcao "Lembrar-me" (sessao de 30 dias)
- Link para cadastro e recuperacao de senha

**Cadastro** (`/auth/register`):
- Formulario: nome, CPF, email, senha, confirmacao
- Endereco opcional (CEP, rua, numero, bairro, cidade, estado)
- Validacao em tempo real dos campos
- Apos registro, redireciona para area do usuario

**Recuperacao de senha** (`/auth/forgot-password` + `/auth/reset-password`):
- Solicita email para envio do token
- Validacao do token + nova senha

### Area do Usuario (`/account/*`)

**Vouchers** (`/account/vouchers`):
- Lista paginada de vouchers do usuario
- Filtro por status: Disponivel, Usado, Expirado
- Cada card mostra: restaurante, oferta, status, codigo

**Detalhe do Voucher** (`/account/vouchers/[id]`):
- QR Code para apresentar ao restaurante
- Codigo `ROC-XXXXX` para validacao manual
- Status atual do voucher
- Informacoes do restaurante e oferta

**Perfil** (`/account/profile`):
- Visualizar e editar dados pessoais
- Nome, email, telefone, endereco

**Pagamento** (`/account/payment`):
- Status da assinatura
- Informacoes de pagamento

**Suporte** (`/account/support`):
- Canal de suporte ao cliente

### Validacao (`/validate`)

Pagina para restaurantes/lojistas validarem vouchers:
- Scanner QR Code integrado
- Campo para digitar codigo manualmente
- Verificacao sem marcar como usado (`/check`)
- Validacao definitiva com confirmacao

### Checkout (`/checkout`)

- Pagina de checkout para assinatura
- Confirmacao de pagamento (`/checkout/success`)

## Componentes

| Componente | Descricao |
|-----------|-----------|
| `Header.tsx` | Barra de navegacao superior |
| `Footer.tsx` | Rodape com links e informacoes |
| `QRScanner.tsx` | Scanner de QR code para validacao |
| `RestaurantCard.tsx` | Card individual de restaurante |
| `RestaurantCarousel.tsx` | Carousel de restaurantes parceiros |

## Lib

### ApiClient (`app/lib/api.ts`)

Cliente HTTP para comunicacao com o backend:

```typescript
const api = new ApiClient();

// Autenticacao
await api.login(email, password, rememberMe);
await api.register({ name, cpf, email, password, ... });
await api.forgotPassword(email);
await api.resetPassword(token, password, passwordConfirmation);

// Perfil
const profile = await api.getProfile();
await api.updateProfile({ full_name, phone, address });

// Vouchers
const { data, total, page, totalPages } = await api.getVouchers({ page, status });
const voucher = await api.getVoucher(id);
await api.useVoucher(id);

// Validacao (para lojista)
const result = await api.checkVoucher(code);   // Verifica sem usar
const result = await api.validateVoucher(code, cpf);  // Valida e marca usado
```

**Gerenciamento de token:**
- Token armazenado no `localStorage`
- Opcao "Lembrar-me" estende sessao para 30 dias
- Logout limpa token e redireciona para login
- Auto-redirect para `/auth/login` em caso de 401

### Supabase Client (`app/lib/supabase.ts`)

Cliente Supabase para funcionalidades em tempo real:

```typescript
import { supabase } from './supabase';

// Usado para Realtime: notificacoes quando voucher e validado
```

## Tecnologias

- **Next.js 16.1.2** - Framework React com SSR/SSG
- **React 19** - Biblioteca UI
- **TailwindCSS 4** - Estilizacao utilitaria
- **Phosphor Icons** - Biblioteca de icones
- **Supabase Client** - Conexao com Supabase (Realtime)
- **Fontes**: Montserrat (corpo), Geist Mono (codigo)
