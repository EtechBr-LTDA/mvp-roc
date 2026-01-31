# Admin - Painel Administrativo

Painel administrativo do ROC Passaporte construido com Next.js 16. Permite gestao completa de usuarios, restaurantes, vouchers e auditoria.

## Estrutura

```
admin/
├── app/
│   ├── dashboard/                          # Area principal (protegida)
│   │   ├── layout.tsx                      # Layout com sidebar + topbar
│   │   ├── page.tsx                        # Dashboard com KPIs e graficos
│   │   ├── users/
│   │   │   ├── page.tsx                    # Lista de usuarios
│   │   │   └── [id]/page.tsx              # Detalhe do usuario
│   │   ├── restaurants/
│   │   │   ├── page.tsx                    # Lista de restaurantes
│   │   │   ├── new/page.tsx               # Criar restaurante
│   │   │   └── [id]/edit/page.tsx         # Editar/gerenciar restaurante
│   │   ├── vouchers/
│   │   │   └── page.tsx                    # Lista de vouchers
│   │   └── audit-logs/
│   │       └── page.tsx                    # Logs de auditoria
│   ├── login/
│   │   └── page.tsx                        # Login do admin
│   ├── components/                         # Componentes reutilizaveis
│   │   ├── AdminSidebar.tsx               # Sidebar de navegacao
│   │   ├── AdminTopbar.tsx                # Barra superior
│   │   ├── StatsCard.tsx                  # Card de estatisticas
│   │   ├── DataTable.tsx                  # Tabela de dados generica
│   │   ├── StatusBadge.tsx                # Badge de status colorido
│   │   └── ConfirmDialog.tsx              # Dialog de confirmacao
│   ├── lib/
│   │   └── api.ts                          # Cliente API admin
│   ├── layout.tsx                          # Layout raiz
│   └── page.tsx                            # Redirect para /dashboard
├── middleware.ts                            # Protecao de rotas (cookie admin_token)
└── package.json
```

## Paginas

### Login (`/login`)

Pagina de autenticacao exclusiva para administradores:
- Formulario email + senha
- Verificacao de role (`admin` ou `super_admin`)
- Token armazenado em `localStorage` + cookie para middleware
- Redirect para `/dashboard` apos login

### Dashboard (`/dashboard`)

Pagina principal com visao geral do sistema:

**KPIs (cards superiores):**
- Total de usuarios cadastrados
- Passaportes ativos (com progresso visual)
- Receita estimada
- Taxa de uso de vouchers (barra de progresso)

**Vouchers por status:**
- Barras de progresso coloridas: Disponiveis (verde), Usados (azul), Expirados (cinza)

**Top 5 Restaurantes:**
- Grafico de barras (Recharts) com restaurantes mais validados

**Validacoes Recentes:**
- Tabela com ultimas validacoes: codigo, usuario (clicavel), restaurante (clicavel), status, data

```typescript
// Dados do dashboard
interface DashboardStats {
  totalUsers: number;
  activePasses: number;
  estimatedRevenue: number;
  vouchers: { total: number; available: number; used: number; expired: number };
  recentValidations: any[];
}
```

### Usuarios (`/dashboard/users`)

Lista de usuarios com gestao completa:

**Funcionalidades:**
- Busca debounced (400ms) por nome, email ou CPF
- Filtro por status: Todos, Ativos, Suspensos
- Toggle "Exibir tudo": mostra CPF completo, cidade, status, data de criacao
- Contador total de usuarios
- Acoes diretas na tabela: "Gerenciar" e "Suspender/Ativar"

**Detalhe do usuario** (`/dashboard/users/[id]`):
- Avatar com iniciais + header com nome e email
- Layout 2/3 + 1/3:
  - Dados pessoais (nome, email, CPF, telefone, cidade, endereco)
  - Status da conta (role, data de cadastro, suspensao)
- Historico de vouchers do usuario com oferta, status e botao copiar codigo
- Barra de progresso de uso de vouchers

```typescript
// Acoes disponiveis
await adminApi.suspendUser(userId);   // Suspender usuario
await adminApi.activateUser(userId);  // Reativar usuario
```

### Restaurantes (`/dashboard/restaurants`)

Gestao de restaurantes parceiros:

**Funcionalidades:**
- Busca debounced por nome, cidade ou categoria
- Filtro por status: Todos, Ativos, Inativos
- Toggle "Exibir tudo": mostra ID, cidade, categoria, oferta principal
- Botao "Exportar CSV" com todos os dados
- Botao "Novo Restaurante" para criar
- Acoes diretas: "Gerenciar" e "Desativar/Ativar"
- Nome clicavel leva ao detalhe

**Detalhe/Edicao** (`/dashboard/restaurants/[id]/edit`):
- Header visual com icone, nome, ID e cidade
- Layout 2/3 + 1/3:
  - Dados cadastrais (modo visualizacao/edicao alternavel)
  - Status da parceria + oferta em destaque
- Acoes rapidas: Editar, Desativar/Ativar, Voltar
- Formulario com: Nome, Cidade, Categoria, Oferta Principal, Descricao, URL da Imagem

```typescript
// Criar restaurante
await adminApi.createRestaurant({
  name: "Restaurante ABC",
  city: "Porto Velho",
  discount_label: "20% de desconto",
  category: "Italiana",
  description: "...",
  image_url: "https://..."
});

// Alternar status
await adminApi.toggleRestaurant(restaurantId);
```

### Vouchers (`/dashboard/vouchers`)

Auditoria e gestao de vouchers:

**Funcionalidades:**
- Busca debounced por codigo, usuario ou restaurante
- Filtro por status: Todos, Disponiveis, Usados, Expirados
- Toggle "Exibir tudo": mostra Oferta, Criado em, Usado em (com hora), Expira em
- Botao "Exportar CSV"
- Codigo com botao copiar (feedback visual com check verde)
- Nome do usuario clicavel (link para detalhe do usuario)
- Nome do restaurante clicavel (link para detalhe do restaurante)
- Coluna Oferta com badge amarela e icone
- Botao "Validar" para vouchers disponiveis (com dialog de confirmacao)

```typescript
// Validar voucher manualmente
await adminApi.manualValidateVoucher(voucherId);
```

### Audit Logs (`/dashboard/audit-logs`)

Registro de todas as acoes administrativas:

**Funcionalidades:**
- Busca debounced por admin ou ID alvo
- Filtro por tipo de acao (dropdown)
- Toggle "Exibir tudo": mostra Tipo traduzido, ID Alvo, Detalhes com tooltip
- Botao "Exportar CSV"
- Badges coloridos por tipo de acao:

| Acao | Cor | Icone |
|------|-----|-------|
| Usuario Suspenso | Vermelho | UserMinus |
| Usuario Ativado | Verde | UserCheck |
| Restaurante Criado | Azul | Storefront |
| Restaurante Atualizado | Amarelo | PencilSimple |
| Restaurante Alternado | Roxo | ArrowsClockwise |
| Voucher Validado | Teal | Ticket |

## Componentes

### AdminSidebar (`components/AdminSidebar.tsx`)

Sidebar de navegacao fixa a esquerda (largura 256px):
- Logo "ROC Admin" com subtitulo "Painel"
- Label "Menu" para secao de navegacao
- Links: Dashboard, Usuarios, Restaurantes, Vouchers, Audit Logs
- Icones padronizados (Phosphor Icons, size 20)
- Item ativo com destaque em cor primaria + sombra
- Footer com link para site do usuario

### AdminTopbar (`components/AdminTopbar.tsx`)

Barra superior com:
- Breadcrumb da pagina atual
- Nome do admin logado
- Botao de logout

### StatsCard (`components/StatsCard.tsx`)

Card de estatistica para o dashboard:

```typescript
interface StatsCardProps {
  label: string;           // Titulo do card
  value: string | number;  // Valor principal
  icon: ReactNode;         // Icone (Phosphor)
  color: string;           // Cor do icone
  subtitle?: string;       // Texto auxiliar
  progress?: {             // Barra de progresso opcional
    value: number;
    max: number;
  };
}
```

### DataTable (`components/DataTable.tsx`)

Tabela de dados generica com:
- Busca integrada (onSearch callback)
- Paginacao em portugues (Anterior/Proximo)
- Estado de loading (skeleton)
- Mensagem de vazio customizavel
- Colunas com render customizado

### StatusBadge (`components/StatusBadge.tsx`)

Badge de status com cores automaticas:

| Status | Cor |
|--------|-----|
| Ativo, Disponivel | Verde |
| Usado, Validado | Azul |
| Suspenso, Cancelado | Vermelho |
| Pendente | Amarelo |
| Inativo, Expirado | Cinza |

### ConfirmDialog (`components/ConfirmDialog.tsx`)

Modal de confirmacao com:
- Titulo e mensagem customizaveis
- Botoes "Cancelar" e acao (label customizavel)
- Variantes: `primary` (azul) e `danger` (vermelho)

## Lib

### AdminApiClient (`lib/api.ts`)

Cliente HTTP exclusivo para o admin:

```typescript
const adminApi = new AdminApiClient(BACKEND_URL);

// Autenticacao
await adminApi.login(email, password);
adminApi.clearAuth();               // Logout
adminApi.isAuthenticated();          // Verifica se logado
adminApi.getAdminName();             // Nome do admin
adminApi.getAdminRole();             // Role do admin

// Dashboard
const stats = await adminApi.getDashboard();

// Usuarios
const { data, total, page, totalPages } = await adminApi.getUsers({ page, limit, search, status });
const user = await adminApi.getUserDetail(id);
await adminApi.suspendUser(id);
await adminApi.activateUser(id);

// Restaurantes
const list = await adminApi.getRestaurants({ page, limit, search, active });
await adminApi.createRestaurant(data);
await adminApi.updateRestaurant(id, data);
await adminApi.toggleRestaurant(id);

// Vouchers
const vouchers = await adminApi.getVouchers({ page, limit, status, search, user_id, restaurant_id });
await adminApi.manualValidateVoucher(id);

// Audit Logs
const logs = await adminApi.getAuditLogs({ page, limit, action, admin_id });
```

**Seguranca do token:**
- Token armazenado em `localStorage` + cookie `admin_token`
- Cookie usado pelo middleware para protecao de rotas SSR
- Auto-redirect para `/login` em caso de 401
- Verificacao de role no login (rejeita usuarios comuns)

## Middleware (`middleware.ts`)

Protecao de rotas server-side:
- Verifica cookie `admin_token` em todas as rotas `/dashboard/*`
- Redireciona para `/login` se nao autenticado
- Permite acesso livre a `/login`, `/_next/*`, `/favicon.ico`

## Padrao UX Consistente

Todas as paginas de listagem seguem o mesmo padrao:

1. **Header**: Titulo + contador (badge) + botoes de acao (exportar, criar)
2. **Barra de filtros**: Busca debounced + filtro dropdown + toggle "Exibir tudo"
3. **Filtros ativos**: Tags removiveis mostrando filtros aplicados
4. **Tabela**: Colunas fixas + colunas opcionais (toggle) + acoes diretas
5. **Paginacao**: Anterior/Proximo em portugues com indicador de pagina
6. **Estados**: Loading (skeleton), vazio (icone + mensagem)

## Tecnologias

- **Next.js 16.1.2** - Framework React
- **React 19** - Biblioteca UI
- **TailwindCSS 4** - Estilizacao com CSS custom properties
- **Phosphor Icons** - Icones consistentes
- **Recharts** - Graficos no dashboard
- **Fonte**: Inter
