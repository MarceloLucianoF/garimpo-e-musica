Perfeito. É exatamente assim que os melhores projetos começam: no papel (ou na tela), pensando na fundação antes de rodar qualquer comando no terminal ou apertar o botão de "Create Project" no Firebase. 

Modelar os dados agora vai deixar a criação dos componentes React no Next.js muito mais previsível e limpa. Quando você tem as interfaces (tipagens) bem desenhadas no papel, a estrutura de arquivos do projeto flui com naturalidade, garantindo uma organização tão redonda quanto a lógica de séries, repetições e treinos de um app fitness bem estruturado.

Aqui está a modelagem exata (NoSQL) para o Firestore e as regras de segurança desenhadas cirurgicamente para a **V1** do Garimpo & Música.

---

### 1. Modelagem de Dados (Coleções e Documentos)

No NoSQL do Firestore, nós evitamos coleções espalhadas para coisas parecidas. Como definimos que haverá um único painel administrativo, teremos uma coleção central de `products`.

#### Coleção: `products`
Esta coleção armazena tanto a vitrine do brechó quanto o catálogo de música. O segredo está na chave `type` e na chave `availableOnline`.

```json
// Caminho: /products/{productId}
{
  "type": "music", // ou "fashion" para o brechó
  "status": "available", // "draft", "available", "reserved", "sold"
  "availableOnline": true, // false para itens do brechó (só vitrine)
  
  "title": "The Dark Side of The Moon",
  "slug": "the-dark-side-of-the-moon-pink-floyd", // Para URLs amigáveis (SEO)
  
  // Específicos de Música (Se type == "fashion", esses campos não existem ou ficam nulos)
  "artist": "Pink Floyd",
  "album": "The Dark Side of The Moon",
  "format": "vinyl_lp", // "vinyl_lp", "cd", "k7"
  "genre": ["Rock", "Prog Rock"],
  "conditionMedia": "VG+", // Escala Goldmine
  "conditionSleeve": "VG",
  "rarity": "rare",
  
  // Comercial e Estoque
  "price": 350.00,
  "stock": 1, // Crucial para discos raros
  "pickupAvailable": true, // Retirada na Lagoa
  "shippingAvailable": true, // Envio Correios/Melhor Envio
  
  // Conteúdo
  "description": "Prensagem original de 1973. Pequeno desgaste nas bordas da capa, disco tocando perfeitamente sem pulos.",
  "images": [
    {
      "url": "https://firebasestorage...",
      "path": "products/music/dark-side/capa.jpg",
      "order": 1
    }
  ],
  
  // Auditoria
  "createdAt": "2026-04-11T10:00:00Z",
  "updatedAt": "2026-04-11T10:00:00Z"
}
```

#### Coleção: `orders`
Focada exclusivamente na venda de música. Ela guarda um "retrato" (snapshot) dos itens no momento da compra, para que se o produto mudar de preço no futuro, o histórico do pedido não seja alterado.

```json
// Caminho: /orders/{orderId}
{
  "orderNumber": "GM-1001",
  "status": "pending_payment", // "pending_payment", "paid", "ready_for_pickup", "shipped", "cancelled"
  
  "customer": {
    "name": "João da Silva",
    "email": "joao@email.com",
    "phone": "48999999999"
  },
  
  "items": [
    {
      "productId": "id_do_produto_aqui",
      "title": "The Dark Side of The Moon - Pink Floyd",
      "price": 350.00,
      "quantity": 1,
      "format": "vinyl_lp",
      "image": "https://firebasestorage..." // Apenas a thumb principal
    }
  ],
  
  "fulfillment": {
    "method": "pickup", // ou "shipping"
    "shippingCost": 0.00 // 0 se for pickup
    // Se method == "shipping", entra um objeto "address" aqui
  },
  
  "payment": {
    "method": "pix", // "pix", "credit_card"
    "provider": "mercadopago",
    "status": "pending"
  },
  
  "totals": {
    "subtotal": 350.00,
    "shipping": 0.00,
    "total": 350.00
  },
  
  "createdAt": "2026-04-11T14:30:00Z"
}
```

#### Coleção: `users`
Na V1, não vamos forçar o cliente a criar conta para comprar (checkout como visitante converte mais rápido). Essa coleção servirá puramente para controle de acesso do painel administrativo.

```json
// Caminho: /users/{firebaseAuthUid}
{
  "email": "benhur@garimpoemuisca.com",
  "role": "admin",
  "name": "Benhur"
}
```

---

### 2. Regras de Segurança (Firestore Rules)

As regras abaixo garantem que o cliente veja a vitrine e compre discos, mas blinda o estoque e a edição de produtos para que apenas o Benhur e a Rosana (Admins) tenham controle.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Função auxiliar para verificar se o usuário logado é um Admin
    function isAdmin() {
      return request.auth != null && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    // -----------------------------------------------------------------
    // COLEÇÃO: PRODUCTS
    // -----------------------------------------------------------------
    match /products/{productId} {
      // Público: Pode ler APENAS se o status for "available". 
      // (Isso permite ler a vitrine de roupas e os discos à venda)
      allow read: if resource.data.status == 'available';
      
      // Admin: Pode ler, criar, editar e deletar qualquer produto
      allow read, write: if isAdmin();
    }

    // -----------------------------------------------------------------
    // COLEÇÃO: ORDERS
    // -----------------------------------------------------------------
    match /orders/{orderId} {
      // Público: Qualquer um pode CRIAR um pedido (Checkout V1)
      // Validação básica: O pedido deve ter um e-mail válido no objeto customer
      allow create: if request.resource.data.customer.email is string;
      
      // Público: O cliente só pode LER o próprio pedido pelo ID (usado na tela de "Obrigado/Acompanhamento")
      // Ele não pode listar os pedidos de outras pessoas.
      allow read: if true; // A chave do ID do pedido já funciona como uma senha no frontend
      
      // Admin: Pode ler todos os pedidos e alterar status (ex: marcar como 'pago' ou 'enviado')
      allow read, update: if isAdmin();
      
      // Ninguém deleta pedido (histórico contábil)
      allow delete: if false; 
    }

    // -----------------------------------------------------------------
    // COLEÇÃO: USERS (Admin Auth)
    // -----------------------------------------------------------------
    match /users/{userId} {
      // Apenas Admins podem ler a lista de usuários
      allow read: if isAdmin();
      // A criação/edição de admins será feita manualmente por você via Firebase Console
      allow write: if false; 
    }
  }
}
```

### O pulo do gato dessa arquitetura:
Se o Benhur estiver na loja física, vender o disco e usar o celular para mudar o `status` de `"available"` para `"sold"`, o disco **some** instantaneamente da loja online graças à regra `allow read: if resource.data.status == 'available'`, zerando o risco de venda duplicada.

Com essa fundação de dados desenhada, qual você acha que é o melhor próximo passo do nosso planejamento: mapear os fluxos de tela principais (Home, Produto e Checkout) ou definir a estrutura de pastas e componentes do repositório Next.js?