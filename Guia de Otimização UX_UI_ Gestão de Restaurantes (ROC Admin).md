## Guia de Otimização UX/UI: Gestão de Restaurantes (ROC Admin)

A tela de Restaurantes é o centro de controle das parcerias. O objetivo é transformar a listagem atual em um painel de gestão de relacionamento e performance, facilitando a tomada de decisões sobre a rede de parceiros.

### 1. Otimização da Visualização Geral

| Elemento Atual | Melhoria Proposta | Justificativa UX/Gestão |
| :--- | :--- | :--- |
| **Título** | Manter "Restaurantes", mas adicionar um contador: **"Restaurantes (Total: 15)"** | Fornece o contexto do volume total de parceiros. |
| **Botão "Novo Restaurante"** | Manter, mas adicionar um botão **"Exportar Lista (CSV)"** ao lado. | Facilita a análise externa e o *reporting*. |
| **Filtro de Status** | Manter o dropdown, mas adicionar opções claras: **"Ativos", "Inativos", "Em Negociação", "Destaque"**. | Permite segmentação rápida para ações de *account management*. |

### 2. Otimização da Tabela de Dados

A tabela deve ser um resumo da saúde da parceria.

| Coluna Atual | Melhoria Proposta | Justificativa de Produtividade |
| :--- | :--- | :--- |
| **ID** | Manter. | |
| **Nome** | Manter, mas tornar o nome **clicável** para ir à página de detalhes do restaurante. | Agiliza a gestão e o suporte ao parceiro. |
| **Cidade** | Manter. | |
| **Categoria** | Manter. | |
| **Desconto** | Mudar para **Oferta Principal** (ex: "20% OFF" ou "Pague 1 Leve 2"). | Foca na oferta de maior valor para o cliente. |
| **Status** | Manter, com cores consistentes (Verde para Ativo, Vermelho para Inativo/Desativado). | Leitura visual rápida do estado da parceria. |
| **Ações (Editar/Desativar)** | Mudar para um botão **"Gerenciar"** que abre um modal ou leva a uma página de detalhes. | Consolida todas as ações (Editar, Desativar, Ver Performance) em um só lugar. |
| **Nova Coluna: Validações (Mês)** | Adicionar o número de cupons validados no mês atual. | KPI crucial para medir o engajamento e a performance do parceiro. |
| **Nova Coluna: Contato Principal** | Adicionar o nome e telefone do contato principal do restaurante. | Essencial para a gestão de relacionamento (CRM). |

### 3. Funcionalidades de Busca e Filtro Avançado

*   **Busca (Search Bar):** Deve buscar em **Nome, Cidade e Categoria** simultaneamente.
*   **Filtro Avançado (Sidebar/Modal):** Adicionar um botão **"Filtros Avançados"** que abre um painel com opções como:
    *   **Validações (Mês):** Maior que X, Menor que Y.
    *   **Oferta Principal:** Filtrar por tipo de oferta (ex: % de Desconto, Pague 1 Leve 2).
    *   **Status de Contrato:** Ativo, Expirado, Renovação Pendente.

### 4. Página de Detalhes do Restaurante (Ao clicar em "Gerenciar")

Esta página deve ser um **Dashboard de Performance do Parceiro**.

| Seção | Conteúdo Sugerido | Objetivo |
| :--- | :--- | :--- |
| **Dados Cadastrais** | Nome, Endereço, Contato Principal, Dados Bancários (com botão "Editar"). | Gestão de relacionamento e pagamentos. |
| **Performance (Gráficos)** | **Gráfico de Linha:** Validações Mensais (últimos 12 meses). **Gráfico de Pizza:** Distribuição de Validações por Oferta. | Análise de ROI e performance das ofertas. |
| **Gestão de Ofertas** | Tabela com todas as ofertas ativas (Nome, Desconto, Validade, Status) com botões de **"Editar"** e **"Desativar"**. | Controle total sobre o que está sendo oferecido. |
| **Histórico de Validações** | Tabela com as últimas validações (Código, Usuário, Data). | Auditoria e suporte ao lojista. |

Essas otimizações transformam a tela de Restaurantes em uma ferramenta de *Account Management* e análise de performance, elevando a qualidade da gestão de parcerias do ROC Passaporte.
