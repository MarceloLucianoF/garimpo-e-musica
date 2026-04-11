### 1. Fluxo de Descoberta (Foco: Brechó & Visita Local)
O objetivo aqui é puramente vitrine, desejo e atração de tráfego para a loja física na Lagoa da Conceição. O atrito técnico é zero.

1. **Entrada:** Usuário acessa a `Home` (via Instagram, Google ou direto).
2. **Navegação:** Clica na seção **"O Brechó"**.
3. **Exploração (Lookbook):** Visualiza um grid visual focado em fotos grandes (jaquetas, camisas vintage).
4. **Interação:** Clica em uma peça específica que chamou atenção. Em vez de ir para uma página de produto complexa com carrinho, abre um modal rápido ou navega para uma página simples da peça.
5. **Conversão (Lead):** Clica no botão primário **"Tenho Interesse"**.
6. **Saída:** O site abre o WhatsApp (via API de redirecionamento) com uma mensagem pré-preenchida: *"Olá! Vi a [Jaqueta de Couro Vintage] no site e queria saber se ainda está disponível na loja da Lagoa."*

### 2. Fluxo de Compra de Música (Foco: E-commerce)
Aqui o jogo muda. O colecionador quer segurança, detalhes técnicos e uma finalização de compra sem barreiras.

1. **Entrada:** Usuário acessa a `Home` e clica em **"Discos e CDs"** (ou usa a barra de busca).
2. **Catálogo (PLP - Product Listing Page):** * Visualiza a lista de itens.
   * Utiliza os **Filtros Técnicos** (formato: `vinyl_lp`, condição: `VG+`, gênero).
3. **Detalhes do Produto (PDP - Product Detail Page):**
   * Clica no disco desejado.
   * Dá zoom nas fotos reais (capa, verso, mídia).
   * Lê a descrição do estado de conservação e confirma o preço.
4. **Adição:** Clica em **"Adicionar ao Carrinho"**. Um *Drawer* (menu lateral) desliza na tela mostrando o resumo do carrinho e o subtotal.
5. **Início do Checkout:** Clica em **"Finalizar Compra"** no Drawer. É redirecionado para a rota `/checkout`.
6. **Checkout (Sem Login Obrigatório):**
   * **Passo 1 (Contato):** Preenche Nome, E-mail e WhatsApp.
   * **Passo 2 (Entrega):** Seleciona entre *Retirada na Loja (Lagoa)* ou *Envio por Correios* (abre campos de CEP e Endereço).
   * **Passo 3 (Pagamento):** Escolhe PIX. O sistema gera o QR Code / Copia e Cola via API do Mercado Pago na mesma tela.
7. **Sucesso:** Após a confirmação do webhook do pagamento, a tela atualiza para a **Página de Obrigado**, exibindo o número do pedido (`GM-1001`) e as instruções de retirada/envio.

### 3. Fluxo Administrativo (Benhur e Rosana)
Este fluxo acontece no celular ou no balcão da loja. Precisa ser rápido para não atrapalhar o atendimento físico.

**A. Fluxo de Cadastro de Produto:**
1. Acessam `/admin/login` e entram com e-mail e senha.
2. No Dashboard, clicam em **"Novo Produto"**.
3. Selecionam o Tipo: `Música`.
4. Preenchem o formulário: Artista, Álbum, Estado da Capa/Mídia, Preço e marcam `Disponível Online`.
5. Tiram fotos direto do celular pelo componente de *Upload*, que envia direto para o Firebase Storage.
6. Clicam em **"Salvar"**. O Firestore é atualizado e o disco já aparece na vitrine pública.

**B. Fluxo de Baixa de Estoque (Venda Presencial):**
1. O cliente físico compra o "The Dark Side of The Moon" no balcão.
2. Rosana abre o celular, entra no painel admin e busca pelo disco.
3. Com um único clique/toggle, altera o status de `Available` para `Sold`.
4. A coleção `products` atualiza o estado, e quem estiver navegando em casa já verá o item com a flag "Esgotado", bloqueando o botão de compra.
