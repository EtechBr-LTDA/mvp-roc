# Backend - API REST

API REST construida com NestJS 11 e TypeScript, usando Supabase (PostgreSQL) como banco de dados e JWT para autenticacao.

## Estrutura

```
backend/
├── src/
│   ├── config/
│   │   └── supabase.config.ts        # Factory do cliente Supabase
│   ├── database/
│   │   └── database.module.ts         # Provider global SUPABASE_CLIENT
│   ├── modules/
│   │   ├── auth/                      # Autenticacao e perfil
│   │   ├── users/                     # Gestao de usuarios
│   │   ├── restaurants/               # Catalogo de restaurantes
│   │   ├── vouchers/                  # Vouchers do usuario
│   │   ├── validation/                # Validacao de vouchers (lojista)
│   │   ├── admin/                     # Painel administrativo
│   │   └── campaigns/                 # Campanhas (futuro)
│   ├── app.module.ts                  # Modulo raiz
│   └── main.ts                        # Bootstrap
├── scripts/
│   └── seed-admin.ts                  # Script para criar admin
├── sql/
│   └── 20260130_admin_setup.sql       # SQL para tabelas admin
└── package.json
```

## Modulos

### Auth (`src/modules/auth/`)

Modulo de autenticacao com JWT, registro, login, recuperacao de senha e gerenciamento de perfil.

**Arquivos:**
- `auth.controller.ts` - Endpoints de autenticacao
- `auth.service.ts` - Logica de autenticacao
- `jwt.strategy.ts` - Estrategia Passport JWT
- `jwt-auth.guard.ts` - Guard de autenticacao JWT
- `admin.guard.ts` - Guard de role admin
- `current-user.decorator.ts` - Decorator `@CurrentUser()` para extrair usuario do JWT
- `roles.decorator.ts` - Decorator `@Roles()` para acesso por role
- `password-reset.service.ts` - Gerenciamento de tokens de reset de senha
- `dto/index.ts` - DTOs de validacao

**Endpoints:**

| Metodo | Rota | Descricao | Auth | Rate Limit |
|--------|------|-----------|------|------------|
| POST | `/auth/register` | Registrar usuario | Nao | 5/min |
| POST | `/auth/login` | Login | Nao | 5/min |
| POST | `/auth/forgot-password` | Solicitar reset de senha | Nao | 3/min |
| POST | `/auth/validate-reset-token` | Validar token de reset | Nao | - |
| POST | `/auth/reset-password` | Resetar senha | Nao | 3/min |
| GET | `/auth/profile` | Obter perfil do usuario | JWT | - |
| PUT | `/auth/profile` | Atualizar perfil | JWT | - |

**DTOs:**

```typescript
// RegisterDto
{
  name: string;          // Nome completo
  cpf: string;           // CPF (11 digitos)
  email: string;         // Email valido
  password: string;      // Min 8 chars, 1 maiuscula, 1 minuscula, 1 numero
  passwordConfirmation: string;
  address?: AddressDto;  // Endereco opcional
}

// LoginDto
{
  email: string;
  password: string;
}

// AddressDto
{
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
}
```

**Fluxo de Registro:**
1. Valida dados (email unico, CPF unico, senha forte)
2. Cria perfil no Supabase com senha hasheada (bcrypt, 10 rounds)
3. Cria registro de `pass` (assinatura ativa)
4. Gera vouchers (1 por restaurante ativo)
5. Retorna JWT token + dados do usuario

---

### Users (`src/modules/users/`)

Servico de gerenciamento de usuarios no banco de dados.

**Metodos principais:**

```typescript
// Criar usuario com hash de senha
async createUser(input: CreateUserInput): Promise<Profile>

// Buscar por email (case-insensitive)
async findByEmail(email: string): Promise<Profile | null>

// Buscar por CPF
async findByCpf(cpf: string): Promise<Profile | null>

// Validar senha (bcrypt compare)
async validatePassword(plain: string, hashed: string): Promise<boolean>

// Formatar perfil para resposta da API (remove senha, formata endereco)
profileToResponse(profile: Profile): any
```

---

### Restaurants (`src/modules/restaurants/`)

Catalogo de restaurantes parceiros. Somente leitura para usuarios.

**Metodos:**

```typescript
// Listar restaurantes ativos (filtro por cidade opcional)
async findAll(city?: string): Promise<Restaurant[]>

// Buscar restaurante por ID
async findById(id: number): Promise<Restaurant | null>

// Listar cidades disponiveis
async getCities(): Promise<string[]>
```

**Interface Restaurant:**
```typescript
interface Restaurant {
  id: number;
  name: string;
  city: string;
  discount_label: string;   // Ex: "20% de desconto"
  image_url?: string;
  category?: string;         // Ex: "Italiana", "Japonesa"
  description?: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}
```

---

### Vouchers (`src/modules/vouchers/`)

Gerenciamento de vouchers do usuario.

**Endpoints (todos requerem JWT):**

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/vouchers` | Listar vouchers do usuario (paginado) |
| GET | `/vouchers/:id` | Detalhe de um voucher |
| POST | `/vouchers/:id/use` | Marcar voucher como usado |

**Geracao de vouchers:**

```typescript
// Gera 1 voucher por restaurante ativo para o usuario
async generateVouchersForUser(profileId: string): Promise<void>

// Formato do codigo: ROC-XXXXX (5 chars alfanumericos)
// Previne duplicatas via profile_id + restaurant_id
```

**Fluxo de uso:**
1. Usuario apresenta voucher (QR code ou codigo)
2. Sistema verifica status (available, used, expired)
3. Marca como `used` com timestamp `used_at`
4. Retorna confirmacao

---

### Validation (`src/modules/validation/`)

Endpoints para validacao de vouchers pelo restaurante/lojista.

**Endpoints:**

| Metodo | Rota | Descricao |
|--------|------|-----------|
| POST | `/validation` | Validar voucher (marca como usado) |
| POST | `/validation/check` | Verificar voucher (NAO marca como usado) |

**Exemplo de uso:**

```typescript
// POST /validation/check
// Body: { code: "ROC-ABC12" }
// Response: { valid: true, voucher: { code, status, restaurant, user_cpf_masked } }

// POST /validation
// Body: { code: "ROC-ABC12", cpf: "12345678900" }
// Response: { message: "Voucher validado com sucesso", voucher: {...} }
```

O CPF e mascarado na resposta: `123.***.***-00`

---

### Admin (`src/modules/admin/`)

Painel administrativo com gestao completa. Todos os endpoints requerem JWT + role `admin` ou `super_admin`.

**Endpoints:**

| Metodo | Rota | Descricao |
|--------|------|-----------|
| GET | `/admin/dashboard` | Estatisticas do dashboard |
| GET | `/admin/users` | Listar usuarios (paginado, busca, filtro) |
| GET | `/admin/users/:id` | Detalhe do usuario |
| POST | `/admin/users/:id/suspend` | Suspender usuario |
| POST | `/admin/users/:id/activate` | Reativar usuario |
| GET | `/admin/restaurants` | Listar restaurantes |
| POST | `/admin/restaurants` | Criar restaurante |
| PUT | `/admin/restaurants/:id` | Atualizar restaurante |
| PATCH | `/admin/restaurants/:id/toggle` | Alternar status ativo/inativo |
| GET | `/admin/vouchers` | Listar vouchers |
| POST | `/admin/vouchers/:id/validate` | Validar voucher manualmente |
| GET | `/admin/audit-logs` | Logs de auditoria |

**Dashboard Stats:**

```typescript
interface DashboardStats {
  totalUsers: number;
  activePasses: number;
  estimatedRevenue: number;
  vouchers: {
    total: number;
    available: number;
    used: number;
    expired: number;
  };
  recentValidations: any[];
}
```

**Audit Logging:**

Toda acao admin e logada automaticamente:

```typescript
// Acoes registradas:
// user_suspended, user_activated
// restaurant_created, restaurant_updated, restaurant_toggled
// voucher_validated

// Estrutura do log:
{
  admin_id: string;      // ID do admin que executou
  action: string;        // Tipo da acao
  target_type: string;   // "user" | "restaurant" | "voucher"
  target_id: string;     // ID do alvo
  details: object;       // Detalhes adicionais (JSON)
  created_at: string;    // Timestamp
}
```

---

## Seguranca

### Rate Limiting

Configurado no `app.module.ts` via `ThrottlerModule`:

```typescript
ThrottlerModule.forRoot([
  { name: 'short', ttl: 1000, limit: 10 },    // 10 req/segundo
  { name: 'medium', ttl: 60000, limit: 100 },  // 100 req/minuto
  { name: 'long', ttl: 3600000, limit: 1000 }, // 1000 req/hora
])
```

### Guards

```typescript
// JWT Guard - Valida token Bearer
@UseGuards(JwtAuthGuard)

// Admin Guard - Verifica role admin/super_admin
@UseGuards(JwtAuthGuard, AdminGuard)
@Roles('admin', 'super_admin')
```

### CORS

Configurado no `main.ts`:

```typescript
app.enableCors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    process.env.ADMIN_URL || 'http://localhost:3002',
  ],
  credentials: true,
});
```

## Scripts

### Seed Admin

Cria o usuario admin inicial no banco:

```bash
cd backend
npx ts-node scripts/seed-admin.ts
```

Credenciais criadas:
- Email: adm@roc.com.br
- Senha: Admin@123
- Role: super_admin
