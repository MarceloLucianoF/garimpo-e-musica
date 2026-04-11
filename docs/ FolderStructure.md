### Estrutura de Pastas (Next.js App Router)

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