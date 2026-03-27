export type MenuItem = {
  name: string;
  price: number;
  description?: string;
  image?: string;
};

export type MenuCategory = {
  id: string;
  name: string;
  items: MenuItem[];
};

export const menuData: MenuCategory[] = [
  {
    id: "sucos",
    name: "Sucos",
    items: [
      { name: "Suco Natural 350ml (Limão)", price: 8, image: "/images/suco-limao.jpg" },
      { name: "Suco Natural 350ml (Laranja)", price: 8, image: "/images/suco-laranja.jpg" },
      { name: "Suco Natural 350ml (Abacaxi)", price: 8, image: "/images/suco-abacaxi.jpg" },
      { name: "Suco Natural 350ml (Maracujá)", price: 8, image: "/images/suco-maracuja.jpg" },
    ],
  },
  {
    id: "bebidas",
    name: "Bebidas",
    items: [
      { name: "Água Mineral", price: 4, image: "/images/agua-mineral.jpg" },
      { name: "Água Mineral c/ Gás", price: 5, image: "/images/agua-gas.jpg" },
      { name: "H2OH", price: 7, image: "/images/h2oh.jpg" },
      { name: "Coca Cola 350ml", price: 6, image: "/images/coca-350.jpg" },
      { name: "Coca Cola 1L", price: 10, image: "/images/coca-1l.jpg" },
      { name: "Coca Cola 2L", price: 15, image: "/images/coca-2l.jpg" },
      { name: "Guaraná 350ml", price: 6, image: "/images/guarana-350.jpg" },
      { name: "Guaraná 1L", price: 9, image: "/images/guarana-1l.jpg" },
      { name: "Fanta 350ml", price: 6, image: "/images/fanta-350.jpg" },
      { name: "Sprite 350ml", price: 6, image: "/images/sprite-350.jpg" },
      { name: "Monster 473ml", price: 12, image: "/images/monster.jpg" },
      { name: "Red Bull", price: 12, image: "/images/redbull.jpg" },
      { name: "Budweiser Long Neck", price: 9, image: "/images/budweiser.jpg" },
      { name: "Heineken Long Neck", price: 10, image: "/images/heineken.jpg" },
    ],
  },
  {
    id: "entradas",
    name: "Entradas",
    items: [
      { name: "Bolinho de Arroz Frito (1 un)", price: 6, description: "Arroz com cream cheese, cebolinha, kani e temperos", image: "/images/bolinho-arroz.png" },
      { name: "Bolinho de Salmão (1 un)", price: 10, description: "Salmão grelhado com cebolinha e cream cheese", image: "/images/bolinho-salmao.png" },
      { name: "Canapé 4 un (Salmão Grelhado)", price: 20, description: "Massa de harumaki frita com salmão cru ou grelhado", image: "/images/canape-salmao.png" },
      { name: "Rolinho Primavera Inteira (Romeu e Julieta)", price: 35, description: "8 unidades", image: "/images/rolinho-primavera.png" },
      { name: "Rolinho Primavera Meia (Romeu e Julieta)", price: 18, description: "4 unidades", image: "/images/rolinho-primavera.png" },
      { name: "Ceviche Inteira", price: 65, image: "/images/ceviche.png" },
    ],
  },
  {
    id: "temakis",
    name: "Temakis",
    items: [
      { name: "Temaki Salmão", price: 38, description: "Alga, arroz, salmão cru, cebolinha e cream cheese", image: "/images/temaki-salmao.png" },
      { name: "Temaki Salmão sem Arroz", price: 48, description: "Alga, salmão cru, cebolinha e cream cheese", image: "/images/temaki-salmao.png" },
      { name: "Temaki Filadélfia sem Arroz", price: 45, description: "Alga, salmão grelhado, cebolinha e cream cheese", image: "https://gdoor-product-api-images.s3.sa-east-1.amazonaws.com/3fdf6891-45b8-4ff8-af8e-46aa50957d37.png" },
      { name: "Temaki Skin sem Arroz", price: 38, description: "Alga, skin salmão, cebolinha e cream cheese", image: "/images/temaki-skin.png" },
      { name: "Temaki Hot sem Arroz", price: 46, description: "Alga, salmão grelhado, cebolinha, cream cheese, empanado e frito", image: "https://gdoor-product-api-images.s3.sa-east-1.amazonaws.com/de781342-bde6-44d7-be72-446c2db22bb9.png" },
      { name: "Temaki California sem Arroz", price: 40, description: "Alga, manga, pepino e kani", image: "https://gdoor-product-api-images.s3.sa-east-1.amazonaws.com/b001051c-91b0-4d79-a70a-c42b38418982.png" },
      { name: "Temaki Camarão sem Arroz", price: 80, description: "Alga, camarão, cebolinha e cream cheese", image: "/images/temaki-camarao.png" },
    ],
  },
  {
    id: "combos",
    name: "Combos",
    items: [
      { name: "Combo 15 Peças", price: 45, description: "2 sashimi, 2 jhow tradicional, 2 baterá, 2 niguiri, 3 uramaki, 2 hossomaki, 2 hot roll", image: "/images/combo-15-pecas.png" },
      { name: "Combo Japa Sushi", price: 60, description: "4 sashimi, 4 jhow salmão, 2 jhow geleia, 4 niguiri, 2 baterá", image: "/images/combo-japa-sushi.png" },
    ],
  },
  {
    id: "pecas-especiais",
    name: "Peças Especiais",
    items: [
      { name: "Jhow Alface", price: 5, description: "Sem arroz, batata doce frita e cream cheese", image: "https://gdoor-product-api-images.s3.sa-east-1.amazonaws.com/44801904-f08a-4528-b4ed-99df1fe6ba8c.png" },
      { name: "Akira", price: 6, description: "Salmão maçaricado, cream cheese e camarão", image: "/images/akira.png" },
    ],
  },
  {
    id: "hot-rolls",
    name: "Hot Rolls",
    items: [
      { name: "Hot Tradicional 1 Peça", price: 3.5, description: "Enrolado frito de salmão e arroz", image: "/images/hot-tradicional.png" },
      { name: "Hot Tradicional 5 Peças", price: 15, description: "Enrolado frito de salmão e arroz", image: "/images/hot-tradicional.png" },
    ],
  },
  {
    id: "sashimi",
    name: "Sashimi",
    items: [
      { name: "Sashimi (Unidade)", price: 5.5, image: "/images/sashimi.png" },
    ],
  },
  {
    id: "tradicionais",
    name: "Tradicionais",
    items: [
      { name: "Hossomaki 1 Peça", price: 3.5, description: "Arroz, alga, cream cheese, salmão cru ou kani", image: "/images/hossomaki.png" },
    ],
  },
  {
    id: "acrescimos",
    name: "Acréscimos",
    items: [
      { name: "Gergelim", price: 10, image: "/images/gergelim.png" },
      { name: "Gengibre", price: 2, image: "/images/gengibre.png" },
      { name: "Adaptador", price: 1, image: "https://gdoor-product-api-images.s3.sa-east-1.amazonaws.com/c565c5c2-8631-4b75-80da-332c728bc427.png" },
      { name: "Trident", price: 3, image: "https://gdoor-product-api-images.s3.sa-east-1.amazonaws.com/6bec6a73-be97-47d6-b32a-6a49dcf7cea2.png" },
      { name: "Babalu", price: 0.5, image: "https://gdoor-product-api-images.s3.sa-east-1.amazonaws.com/d1f0165c-a30f-4fff-b7e3-450e5ce2a734.png" },
    ],
  },
  {
    id: "porcoes",
    name: "Porções",
    items: [
      { name: "Carne de Sol c/ Batata Frita", price: 50, image: "/images/carne-sol-batata.png" },
      { name: "Yakisoba Vegetariano", price: 35, description: "Sem proteína animal", image: "/images/yakisoba-vegetariano.png" },
    ],
  },
  {
    id: "sobremesas",
    name: "Sobremesas",
    items: [
      { name: "Tatuzinho (10 pçs)", price: 25, description: "Goiabada, cream cheese, leite condensado e farinha láctea", image: "https://gdoor-product-api-images.s3.sa-east-1.amazonaws.com/d6b322b9-cd3d-4e48-9684-70b52255cff6.png" },
      { name: "Tatuzinho (5 pçs)", price: 15, description: "Goiabada, cream cheese, leite condensado e farinha láctea", image: "https://gdoor-product-api-images.s3.sa-east-1.amazonaws.com/fa06efe4-1653-4761-bba0-470471ad8787.png" },
      { name: "Petit Gateau", price: 30, image: "https://gdoor-product-api-images.s3.sa-east-1.amazonaws.com/0b33e824-6b0b-4576-90c8-6c269386e425.png" },
    ],
  },
];
