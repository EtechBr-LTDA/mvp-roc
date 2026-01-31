## Guia de Otimização UX/UI: Gestão de Usuários (ROC Admin)

A tela de gestão de usuários é fundamental para o suporte e a análise de crescimento. O foco da otimização é transformar a tabela atual em uma ferramenta de gestão mais poderosa, com filtros avançados e ações rápidas.

### 1. Otimização da Visualização Geral

| Elemento Atual | Melhoria Proposta | Justificativa UX/Gestão |
| :--- | :--- | :--- |
| **Título** | Manter "Usuários", mas adicionar um contador: **"Usuários (Total: 13)"** | Fornece o contexto do volume total de usuários imediatamente. |
| **Filtro de Status** | Manter o dropdown, mas adicionar opções claras: **"Ativos", "Suspensos", "Inativos", "Novos (Últimos 7 dias)"**. | Permite segmentação rápida para ações específicas (ex: reativação). |
| **Botão de Ação** | Adicionar um botão **"+ Novo Usuário"** ou **"Exportar Lista (CSV)"** no canto superior direito. | Facilita a entrada de dados e a análise externa. |

### 2. Otimização da Tabela de Dados

A tabela deve ser o mais informativa e acionável possível.

| Coluna Atual | Melhoria Proposta | Justificativa de Produtividade |
| :--- | :--- | :--- |
| **Nome** | Manter. | |
| **Email** | Manter. | |
| **CPF** | Manter, mas com máscara de visualização (ex: 000.***.***-00). | Proteção de dados e clareza. |
| **Cidade** | Manter. | |
| **Status** | Manter, mas com cores mais vibrantes e consistentes (Verde para Ativo, Vermelho para Suspenso, Cinza para Inativo). | Leitura visual rápida do estado da conta. |
| **Criado em** | Manter. | |
| **Ações (Ver/Suspender)** | Mudar para um menu de três pontos (`...`) ou um botão **"Gerenciar"** que abre um modal ou leva a uma página de detalhes. | Consolida todas as ações (Ver, Suspender, Reativar, Editar) em um só lugar, limpando a tabela. |
| **Nova Coluna: Último Acesso** | Adicionar a data do último login. | Essencial para identificar usuários inativos e planejar campanhas de reengajamento. |
| **Nova Coluna: Passes Ativos** | Adicionar um número (ex: 1/12). | Permite identificar rapidamente usuários que precisam de suporte ou que estão prestes a expirar. |

### 3. Funcionalidades de Busca e Filtro Avançado

A busca atual é básica. Para um grande volume de usuários, é necessário um sistema de filtragem robusto.

*   **Busca (Search Bar):** Deve buscar em **Nome, E-mail e CPF** simultaneamente.
*   **Filtro Avançado (Modal/Sidebar):** Adicionar um botão **"Filtros Avançados"** que abre um painel com opções como:
    *   **Data de Criação:** Intervalo de datas.
    *   **Passes Ativos:** Maior que X, Menor que Y.
    *   **Último Acesso:** Usuários que não acessam há mais de 30/60/90 dias.
    *   **Cidade/Estado:** Filtro geográfico.

### 4. Página de Detalhes do Usuário (Ao clicar em "Gerenciar")

Esta página deve ser um painel de controle completo para o administrador.

| Seção | Conteúdo Sugerido | Objetivo |
| :--- | :--- | :--- |
| **Dados Pessoais** | Nome, E-mail, CPF, Telefone, Endereço (com botão "Editar"). | Gestão de cadastro. |
| **Status da Conta** | Status (Ativo/Suspenso), Data de Criação, Último Acesso (com botões de ação rápida: **Suspender/Reativar**). | Controle de acesso. |
| **Histórico de Passes** | Tabela com Passes Comprados, Data de Compra, Data de Expiração e Status (Ativo/Expirado). | Gestão de faturamento. |
| **Histórico de Validações** | Tabela com todos os cupons validados (Restaurante, Data, Oferta). | Suporte ao cliente e auditoria. |

Essas otimizações transformam a tela de Usuários em uma ferramenta de suporte e análise de dados, elevando a eficiência da equipe administrativa.
