Sensacional a escolha! Adotar o **Tailwind CSS v4.0** (que acabou de sair do forno, literalmente) para este projeto é um movimento de mestre. Ele muda completamente o jogo: adeus `tailwind.config.js` gigante, olá performance absurda e configuração 100% nativa no CSS. 

Como o v4 foi desenhado para a web moderna, ele se encaixa perfeitamente na nossa stack com Next.js. Vamos aproveitar o fato de que agora usamos variáveis nativas (`@theme`), a paleta modernizada `oklch` (que vai deixar as cores terrosas e quentes do brechó muito mais vivas) e as novas propriedades de sombra e gradiente.

Aqui está o **Design System Base** projetado especificamente para o *Garimpo & Música*, usando a nova arquitetura do Tailwind v4.

---

### 1. O Novo "Motor" (Arquivo Global de Estilos)

No Tailwind v4, toda a personalização acontece no seu arquivo CSS principal (geralmente `src/app/globals.css`). Não precisamos mais do arquivo de configuração JS. 

Definimos a "alma visual" do brechó aqui: um tom *off-white* quente para o fundo (trazendo conforto e respiro), um grafite/carvão para os textos (menos agressivo que o preto puro), e tons de ferrugem/terracota e verde-oliva como cores de ação e destaque.

```css
/* src/app/globals.css */
@import "tailwindcss";

@theme {
  /* =========================================
     TIPOGRAFIA
     ========================================= */
  /* Fonte serifada elegante para os títulos (vibe curadoria/editorial) */
  --font-display: "Playfair Display", "Georgia", serif;
  /* Fonte sem serifa limpa para UI, preços e descrições */
  --font-sans: "Inter", "Satoshi", system-ui, sans-serif;

  /* =========================================
     CORES (Usando o modernizado OKLCH do v4)
     ========================================= */
  /* Fundo principal: Um creme/off-white que remete a papel antigo/vinil */
  --color-garimpo-bg: oklch(0.98 0.01 85); 
  
  /* Textos e contrastes: Carvão escuro, mais elegante que o preto #000 */
  --color-garimpo-dark: oklch(0.25 0.02 260); 
  
  /* Cor primária (Botões, destaques): Terracotta/Ferrugem (quente, nostálgico) */
  --color-garimpo-rust: oklch(0.60 0.15 45); 
  --color-garimpo-rust-hover: oklch(0.50 0.15 45);
  
  /* Cor secundária (Apoio, badges): Verde Oliva (natureza, Lagoa da Conceição) */
  --color-garimpo-olive: oklch(0.55 0.08 140);

  /* =========================================
     SOMBRAS COMPLEXAS (Novidade do v4)
     ========================================= */
  /* Criando uma sombra macia para os cards de vinil */
  --shadow-card: 0 4px 20px -2px oklch(0% 0 0 / 0.08);
}

/* Aplicando as cores base ao HTML e comportamento moderno de scrollbar */
@layer base {
  body {
    background-color: var(--color-garimpo-bg);
    color: var(--color-garimpo-dark);
    /* Novidade v4: Ajusta a scrollbar para não ficar branca feia no dark mode/elementos escuros */
    color-scheme: light dark; 
  }
}
```

---

### 2. Criando Componentes com a Nova Sintaxe (v4)

Agora que as variáveis estão no CSS, veja como a criação de componentes React no Next.js fica muito mais limpa e poderosa utilizando as novidades da versão 4.0.

#### A. Botão Principal (Usando `inset-ring` e `not-*`)

Lembra da novidade do `inset-ring-*` e do `not-*`? Podemos criar um botão sólido lindíssimo, com um brilho interno sutil, sem precisar de `box-shadow` customizado complicado.

```tsx
// src/components/ui/Button.tsx
export function Button({ children, ...props }) {
  return (
    <button 
      className="
        bg-garimpo-rust text-white font-sans font-medium px-6 py-3 rounded-md
        /* Novidade v4: Anel interno para dar textura ao botão */
        inset-ring inset-ring-white/20
        /* Transição suave usando variáveis nativas */
        transition-colors hover:bg-garimpo-rust-hover
        /* Novidade v4: Só aplica opacidade se NÃO estiver no hover (exemplo do not-*) */
        not-hover:opacity-95
      "
      {...props}
    >
      {children}
    </button>
  );
}
```

#### B. Card de Produto de Vinil (Usando Gradients v4 e Container Queries)

A página de catálogo musical vai usar os novos gradientes (`bg-linear-*`) e os novos modificadores dinâmicos de espaçamento do v4 (onde não precisamos mais adivinhar se `h-17` existe na config, ele simplesmente calcula dinamicamente).

```tsx
// src/components/catalog/ProductCard.tsx
export function ProductCard({ title, artist, price, condition, imageUrl }) {
  return (
    <article className="
      group relative flex flex-col gap-4 p-4 rounded-xl 
      bg-white shadow-card 
      /* Novidade v4: Transformação 3D subtil no hover para imitar pegar o disco */
      transition-transform duration-300 hover:scale-105 hover:rotate-y-2 transform-3d
    ">
      {/* Imagem do Disco com Gradient Modernizado */}
      <div className="relative aspect-square overflow-hidden rounded-lg bg-zinc-100">
        <img 
          src={imageUrl} 
          alt={title} 
          className="object-cover w-full h-full"
        />
        {/* Novidade v4: bg-linear-to-t substitui o bg-gradient-to-t */}
        <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        
        {/* Badge flutuante de Condição (VG+, NM) */}
        <span className="absolute bottom-3 right-3 bg-garimpo-dark/90 text-white text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">
          {condition}
        </span>
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1">
        <h3 className="font-display font-bold text-lg leading-tight line-clamp-1">{title}</h3>
        <p className="font-sans text-sm text-garimpo-dark/70">{artist}</p>
        <p className="font-sans font-medium text-garimpo-rust mt-2">
          R$ {price.toFixed(2).replace('.', ',')}
        </p>
      </div>
    </article>
  );
}
```

#### C. O Hero da Home (Vibe Editorial)

A entrada do site vai usar a fonte `display` (Playfair) e podemos usar o novo `@starting-style` no futuro para animar a entrada dos elementos sem usar JavaScript (Framer Motion).

```tsx
// src/app/page.tsx (Trecho do Hero)
<section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden">
  {/* Imagem de Fundo */}
  <img 
    src="/foto-loja-lagoa.jpg" 
    alt="Interior da Loja Garimpo & Música" 
    className="absolute inset-0 object-cover w-full h-full opacity-40"
  />
  
  {/* Conteúdo Centralizado */}
  <div className="relative z-10 flex flex-col items-center text-center max-w-3xl px-6">
    <h1 className="font-display text-5xl md:text-7xl font-bold text-garimpo-dark mb-6 tracking-tight">
      Garimpo, Cultura e <span className="italic text-garimpo-rust">Memória</span>.
    </h1>
    <p className="font-sans text-lg md:text-xl text-garimpo-dark/80 mb-10 max-w-xl">
      Descubra peças únicas no nosso brechó na Lagoa da Conceição e explore nossa curadoria de vinis online.
    </p>
    
    <div className="flex flex-col sm:flex-row gap-4">
      <Button>Explorar Discos e CDs</Button>
      <button className="font-sans font-medium text-garimpo-dark underline decoration-garimpo-rust decoration-2 underline-offset-4 hover:text-garimpo-rust transition-colors">
        Conhecer a Loja Física
      </button>
    </div>
  </div>
</section>
```

### O Ganho Real do v4 no MVP

O maior benefício para você, executando este projeto, é que a **velocidade de desenvolvimento dobra**. Você não vai mais precisar parar o código, abrir o `tailwind.config.js`, adicionar uma cor nova, salvar e voltar para o React. Se precisar de uma largura super específica em uma página, basta usar `w-23` (dinâmico) e o v4 gera na hora em microssegundos.