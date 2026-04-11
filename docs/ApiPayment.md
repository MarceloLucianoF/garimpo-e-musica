### 1. Estrutura de Pastas (Next.js App Router)

Esta arquitetura separa claramente as páginas públicas (vitrine), a área administrativa, as integrações externas (Firebase/Mercado Pago) e os componentes reutilizáveis.

```text
garimpo-musica/
├── src/
│   ├── app/                      # Rotas da aplicação (Frontend e Backend)
│   │   ├── (public)/             # Grupo de rotas públicas (compartilham o mesmo layout)
│   │   │   ├── a-loja/
│   │   │   ├── brecho/
│   │   │   ├── musica/
│   │   │   │   └── [slug]/       # Página de detalhes do produto musical
│   │   │   ├── carrinho/
│   │   │   ├── checkout/
│   │   │   └── page.tsx          # Home do site
│   │   ├── admin/                # Área administrativa isolada
│   │   │   ├── login/
│   │   │   ├── dashboard/
│   │   │   ├── produtos/
│   │   │   └── pedidos/
│   │   └── api/                  # Backend: Next.js Route Handlers
│   │       ├── mercadopago/
│   │       │   ├── create-payment/route.ts  # Gera o PIX/Cartão
│   │       │   └── webhook/route.ts         # Recebe confirmação de pagamento
│   │       └── firebase/
│   │           └── sync-stock/route.ts      # Lógicas seguras de banco de dados
│   ├── components/               # UI components
│   │   ├── ui/                   # Botões, Inputs, Modais (Design System)
│   │   ├── layout/               # Header, Footer, Sidebar Admin
│   │   └── features/             # Componentes de domínio (ProductCard, CartDrawer)
│   ├── lib/                      # Configurações e integrações externas
│   │   ├── firebase/             # Inicialização do App, Auth, Firestore e Storage
│   │   ├── mercadopago/          # Configuração do SDK do MP
│   │   └── utils.ts              # Funções auxiliares (ex: formatCurrency)
│   ├── hooks/                    # Custom hooks (ex: useCart, useAuth)
│   ├── types/                    # Tipagens TypeScript (Product, Order, User)
│   └── store/                    # Gerenciamento de estado global (Zustand ou Context API)
├── public/                       # Favicon, imagens estáticas
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

**Por que essa estrutura funciona bem?**
A pasta `app/api/` funciona como o seu backend Node.js. Isso significa que você não precisa expor as chaves secretas do Mercado Pago no frontend. O cliente faz a requisição para a sua própria API, e a API conversa de forma segura com o Mercado Pago.

---

### 2. Integração com Mercado Pago (Foco na V1: PIX)

Para um e-commerce enxuto, recomendo utilizar a **API Transparente** (SDK do Mercado Pago para Node.js). Assim, o cliente não sai do seu site para pagar; ele vê o QR Code e o "Copia e Cola" direto na sua tela de checkout.

#### Passo 1: Configurando o SDK no Backend
Na pasta `src/lib/mercadopago/index.ts`, você inicializa o cliente:

```typescript
import { MercadoPagoConfig, Payment } from 'mercadopago';

// O Access Token de Produção ou Teste (nunca exponha isso no frontend)
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });
export const payment = new Payment(client);
```

#### Passo 2: Criando o Pagamento PIX (A Rota da API)
No arquivo `src/app/api/mercadopago/create-payment/route.ts`, você recebe os dados do carrinho e gera a cobrança.

```typescript
import { NextResponse } from 'next/server';
import { payment } from '@/lib/mercadopago';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderId, amount, customerEmail } = body;

    const paymentResponse = await payment.create({
      body: {
        transaction_amount: amount,
        description: `Garimpo & Música - Pedido ${orderId}`,
        payment_method_id: 'pix',
        payer: {
          email: customerEmail,
        },
        // A URL para onde o MP vai avisar que o pagamento caiu
        notification_url: 'https://sua-url-de-producao.com/api/mercadopago/webhook'
      }
    });

    // Retornamos os dados do PIX para o frontend desenhar a tela
    return NextResponse.json({
      qr_code: paymentResponse.point_of_interaction?.transaction_data?.qr_code,
      qr_code_base64: paymentResponse.point_of_interaction?.transaction_data?.qr_code_base64,
      payment_id: paymentResponse.id,
    });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao gerar pagamento' }, { status: 500 });
  }
}
```

#### Passo 3: O Webhook (Onde a mágica do estoque acontece)
Quando o cliente paga o PIX no aplicativo do banco, o Mercado Pago envia um "aviso" (webhook) para o seu sistema quase em tempo real. Isso fica em `src/app/api/mercadopago/webhook/route.ts`.

```typescript
import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase/admin'; // Firebase Admin SDK para atualizar o banco com segurança

export async function POST(request: Request) {
  // O MP envia o ID do pagamento na URL do webhook
  const url = new URL(request.url);
  const paymentId = url.searchParams.get('data.id');
  const action = url.searchParams.get('action');

  if (action === 'payment.created' || action === 'payment.updated') {
    // 1. Consultar a API do MP para verificar o status real
    // 2. Se status === 'approved', você:
    //    - Atualiza a coleção 'orders' no Firestore para status = 'paid'
    //    - Atualiza a coleção 'products' diminuindo o estoque (baixa automática)
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
```

### O Fluxo Completo do Checkout

1. O cliente preenche os dados e clica em "Gerar PIX".
2. O seu Frontend (React) chama a rota `/api/mercadopago/create-payment`.
3. A rota devolve a string longa do PIX (Copia e Cola) e a imagem Base64 do QR Code.
4. O Frontend exibe isso na tela e começa a "ouvir" o documento do pedido no Firestore.
5. O cliente paga. O Mercado Pago bate no seu Webhook.
6. O Webhook atualiza o Firestore marcando o pedido como `paid`.
7. Como o Frontend está ouvindo o Firestore (via Firebase SDK `onSnapshot`), a tela do cliente atualiza instantaneamente para "Pagamento Aprovado!" sem ele precisar recarregar a página.

Este fluxo é extremamente robusto para vendas de itens únicos como vinis raros, pois garante que a reserva e a baixa do estoque sejam validadas no backend.