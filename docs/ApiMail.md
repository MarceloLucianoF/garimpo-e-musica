### A Arquitetura do Melhor Envio no Next.js

Para não sobrecarregar o desenvolvimento da V1, a estratégia ideal é dividir o uso do Melhor Envio em duas partes:

1. **A Vitrine (Automatizada no seu código):** O cliente digita o CEP no carrinho e o seu Next.js consulta a API REST do Melhor Envio para devolver os valores e prazos exatos.
2. **A Operação (Manual no painel deles na V1):** Quando o Pix cai, em vez de você codar toda a complexidade de "comprar etiqueta" dentro do seu próprio painel de Admin, o Benhur simplesmente entra no site do Melhor Envio, gera a etiqueta com os dados do cliente, imprime e despacha. (Na V2, você automatiza essa parte via API).

### O Código: Rota de Cálculo de Frete

No Next.js, você criará uma rota específica para isso, isolando o seu *Token de Acesso* (para ninguém roubá-lo pelo navegador).

**Arquivo:** `src/app/api/shipping/calculate/route.ts`

```typescript
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { toPostalCode } = await request.json();

    // CEP da loja física na Lagoa da Conceição
    const FROM_POSTAL_CODE = '88062000'; 

    // O Melhor Envio usa uma API RESTful moderna com Bearer Token
    const response = await fetch('https://www.melhorenvio.com.br/api/v2/me/shipment/calculate', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
        'User-Agent': 'Garimpo E Musica (seu-email@dominio.com)' // Exigência deles
      },
      body: JSON.stringify({
        from: { postal_code: FROM_POSTAL_CODE },
        to: { postal_code: toPostalCode },
        // Embalagem padrão para 1 disco de Vinil
        products: [
          {
            id: 'vinil',
            width: 32,
            height: 5,
            length: 32,
            weight: 0.5, // 500g
            insurance_value: 0, // Se quiser segurar o valor do disco
            quantity: 1
          }
        ]
      })
    });

    const data = await response.json();

    // Filtramos para mostrar apenas as opções que fazem sentido (ex: Correios PAC, Sedex e Jadlog)
    const options = data.filter((service: any) => 
      !service.error && ['1', '2', '3', '4'].includes(String(service.id))
    ).map((service: any) => ({
      id: service.id,
      name: service.name,
      price: parseFloat(service.price),
      customDeliveryTime: service.custom_delivery_time // Prazo em dias
    }));

    return NextResponse.json({ options });

  } catch (error) {
    return NextResponse.json({ error: 'Erro ao calcular frete no Melhor Envio' }, { status: 500 });
  }
}
```

### O que acontece no Frontend?

No carrinho, o seu componente React vai fazer um simples `POST` para `/api/shipping/calculate` enviando apenas o `{"toPostalCode": "01001-000"}`. 

Ele recebe o array de `options` e você renderiza botões do tipo radio (Bolacha) para o cliente escolher:
* 🔘 **Correios PAC** - 7 dias - R$ 22,50
* ⚪ **Correios SEDEX** - 3 dias - R$ 45,00
* ⚪ **Retirada na Loja (Lagoa)** - Grátis

---

### Resumo do Backend

Com isso, trancamos a tríade pesada do Back-end da nossa V1:
1. **Banco de Dados & Regras:** Firestore mapeado com blindagem anti-duplicação de estoque.
2. **Checkout & Pagamento:** Mercado Pago gerando PIX Transparente e Webhook para baixa automática.
3. **Logística:** Melhor Envio calculando frete real sem amarrar a operação física.