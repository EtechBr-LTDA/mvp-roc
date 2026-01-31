## Guia de Otimização UX/UI: Gestão de Vouchers (ROC Admin)

A tela de Vouchers é a base para a auditoria e o suporte ao cliente. O objetivo é transformar a listagem atual em uma ferramenta de rastreabilidade completa, que permita ao administrador entender o ciclo de vida de cada cupom.

### 1. Otimização da Visualização Geral

| Elemento Atual | Melhoria Proposta | Justificativa UX/Gestão |
| :--- | :--- | :--- |
| **Título** | Manter "Vouchers", mas adicionar um contador: **"Vouchers (Total: X.XXX)"** | Fornece o contexto do volume total de cupons emitidos. |
| **Botão de Ação** | Adicionar um botão **"Exportar Dados (CSV)"** no canto superior direito. | Essencial para auditoria e análise de dados. |
| **Filtro de Status** | Manter o dropdown, mas com status claros: **"Disponível", "Usado", "Expirado", "Estornado"**. | Permite a segmentação rápida para ações de suporte e auditoria. |

### 2. Otimização da Tabela de Dados

A tabela deve contar a história de cada voucher.

| Coluna Atual | Melhoria Proposta | Justificativa de Auditoria |
| :--- | :--- | :--- |
| **Código** | Manter, mas adicionar um ícone de **"Copiar"** e tornar o código **clicável** para ir à página de detalhes do voucher. | Facilita a busca e a auditoria em outros sistemas. |
| **Usuário** | Manter, mas tornar o nome **clicável** para ir à página de detalhes do usuário. | Agiliza o suporte ao cliente. |
| **Restaurante** | Manter, mas tornar o nome **clicável** para ir à página de detalhes do restaurante. | Rastreabilidade completa da transação. |
| **Status** | Manter, com cores consistentes (Verde para Disponível, Azul para Usado, Vermelho para Expirado/Estornado). | Leitura visual rápida do estado do cupom. |
| **Criado em** | Manter. | |
| **Usado em** | Manter, mas preencher com a data e hora exatas da validação. | Essencial para a auditoria de tempo. |
| **Ações (Validar)** | Mudar para um botão **"Gerenciar"** ou **"Ver Detalhes"** que abre um modal ou leva a uma página de detalhes. | A ação de "Validar" não deve ser a principal aqui, pois a validação deve ocorrer no Portal do Lojista. A ação principal deve ser de auditoria/suporte (ex: Estornar). |
| **Nova Coluna: Oferta** | Adicionar uma coluna indicando qual oferta o voucher representa (ex: "20% OFF", "Pague 1 Leve 2"). | Essencial para análise de performance de ofertas. |
| **Nova Coluna: Expira em** | Adicionar a data de expiração do voucher. | Permite a gestão proativa de cupons prestes a expirar. |

### 3. Funcionalidades de Busca e Filtro Avançado

*   **Busca (Search Bar):** Deve buscar em **Código, Usuário e Restaurante** simultaneamente.
*   **Filtro Avançado (Modal/Sidebar):** Adicionar um botão **"Filtros Avançados"** que abre um painel com opções como:
    *   **Data de Criação:** Intervalo de datas.
    *   **Data de Uso:** Intervalo de datas.
    *   **Data de Expiração:** Próximos 7 dias, Próximos 30 dias.
    *   **Oferta:** Filtrar por tipo de oferta.

### 4. Página de Detalhes do Voucher (Ao clicar em "Gerenciar")

Esta página deve ser o **Registro de Auditoria** do voucher.

| Seção | Conteúdo Sugerido | Objetivo |
| :--- | :--- | :--- |
| **Informações Básicas** | Código, Oferta, Data de Criação, Data de Expiração. | Identificação rápida. |
| **Status e Histórico** | Status Atual (com tag colorida) e um log de eventos (Criado por, Validado por [Restaurante], Estornado por [Admin]). | Rastreabilidade completa e prova de auditoria. |
| **Links Relacionados** | Link para o perfil do Usuário e para o perfil do Restaurante. | Navegação rápida para suporte. |
| **Ações de Suporte** | Botões de **"Estornar Uso"** (com confirmação) e **"Reenviar para o Usuário"**. | Ferramentas essenciais para o suporte ao cliente. |

Essas otimizações transformam a tela de Vouchers em uma ferramenta de auditoria e suporte de nível profissional, garantindo a integridade e a rastreabilidade de todas as transações do ROC Passaporte.
