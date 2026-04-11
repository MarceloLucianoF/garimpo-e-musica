# Garimpo e Musica

Plataforma digital hibrida para o projeto Garimpo & Musica Brecho Lagoa da Conceicao.

Este repositorio concentra duas frentes:

- Presenca digital do brecho fisico (vitrine e descoberta)
- E-commerce de musica (vinil e CD) com foco em catalogo curado, confianca e operacao enxuta

## Objetivo do Produto

A primeira versao (MVP) prioriza:

- Fortalecer a marca local da loja fisica na Lagoa da Conceicao
- Exibir o brecho como vitrine digital, sem vender toda a moda online nesta fase
- Vender produtos musicais online com fluxo completo: catalogo, carrinho, checkout, pagamento e pedido
- Manter administracao simples para uso direto pelos donos

## Stack Tecnologica

- Next.js (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- Firebase (Auth, Firestore, Storage)
- Mercado Pago (pagamentos)
- Zustand (estado do carrinho)
- React Hook Form + Zod (formularios e validacao)

## Estrutura de Rotas

### Publico

- `/` Home
- `/a-loja` Institucional da marca e historia
- `/brecho` Vitrine do brecho
- `/musica` Catalogo musical
- `/musica/[slug]` Detalhe de produto musical
- `/carrinho`
- `/checkout`

### Admin

- `/admin/login`
- `/admin/dashboard`
- `/admin/produtos`
- `/admin/pedidos`

### API (Route Handlers)

- `/api/mercadopago/create-payment`
- `/api/mercadopago/webhook`
- `/api/shipping/calculate`
- `/api/firebase/sync-stock`

## Arquitetura de Dados (Firestore)

Colecoes principais planejadas:

- `products`: itens de musica e vitrine (com `type`, `status`, `availableOnline`, preco, estoque e imagens)
- `orders`: pedidos com snapshot dos itens, cliente, pagamento e fulfillment
- `users`: controle de acesso admin

Diretrizes-chave:

- Item de musica raro com controle de estoque estrito
- Atualizacao de pedido por webhook de pagamento
- Fluxo para evitar venda duplicada entre loja fisica e online

## Integracoes Externas

- Mercado Pago
	- Criacao de pagamento (PIX/cartao)
	- Webhook para confirmacao e mudanca de status do pedido
- Frete (Melhor Envio)
	- Calculo de opcoes e prazo no checkout
	- Operacao de etiqueta inicialmente manual (V1)

## Setup Local

### 1. Requisitos

- Node.js 20+
- npm 10+

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variaveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
# Firebase (client)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Mercado Pago
MP_ACCESS_TOKEN=

# Frete
MELHOR_ENVIO_TOKEN=
```

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Abra `http://localhost:3000` no navegador.

## Scripts

- `npm run dev`: inicia ambiente de desenvolvimento
- `npm run build`: gera build de producao
- `npm run start`: sobe app em modo producao
- `npm run lint`: executa lint

## Status Atual

- Estrutura principal de pastas e rotas criada
- Documentacao de produto, UX e arquitetura definida em `docs/`
- Integracoes de pagamento/frete ja mapeadas na arquitetura, com rotas API presentes e prontas para implementacao

## Documentacao do Projeto

Os detalhes de negocio, UX e arquitetura estao em:

- `docs/ProjectContext.md`: contexto da marca, escopo e direcao do MVP
- `docs/HomePage.md`: estrategia e composicao da Home
- `docs/ScreenFlows.md`: fluxos de descoberta, compra e admin
- `docs/NoSQL+Firestore.md`: modelagem de dados e regras de seguranca
- `docs/ApiPayment.md`: fluxo de pagamento com Mercado Pago
- `docs/ApiMail.md`: fluxo de calculo/logistica de frete
- `docs/DesignBase.md`: base visual e design system
- `docs/ FolderStructure.md`: proposta de estrutura de pastas (arquivo com espaco inicial no nome)

## Principios do MVP

- Confianca em primeiro lugar
- Curadoria acima de volume
- Simplicidade operacional
- Identidade local como diferencial
- Crescimento gradual com controle de custo
