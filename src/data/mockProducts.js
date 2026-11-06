export const categories = [
  { id: "all", label: { fr: "All", ar: "الكل" } },
  { id: "jackets", label: { fr: "Jackets", ar: "جاكيتات" } },
  { id: "hoodies", label: { fr: "Hoodies", ar: "هوديز" } },
  { id: "cargo", label: { fr: "Cargo Pants", ar: "بناطيل كارجو" } },
];

export const products = [
  {
    id: "void-box-hoodie",
    category: "hoodies",
    name: { fr: "Hoodie boxy Void", ar: "هودي فويد البوكسي" },
    description: {
      fr: "Sweat oversize à capuche lourde, épaule tombante et noir profond.",
      ar: "هودي واسع وثقيل، كتف ساقط وسواد عميق.",
    },
    price: 14500,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { fr: "Noir", ar: "أسود" },
      { fr: "Charbon", ar: "فحمي" },
    ],
    stock: 8,
    image: "/products/hoodie-void.jpg",
  },
  {
    id: "night-layer-hoodie",
    category: "hoodies",
    name: { fr: "Hoodie Night Layer", ar: "هودي الطبقة الليلية" },
    description: {
      fr: "Double couche sombre, coupe carrée et capuche profonde.",
      ar: "طبقة مزدوجة داكنة، قصة مربعة وقبعة عميقة.",
    },
    price: 12800,
    sizes: ["M", "L", "XL", "XXL"],
    colors: [{ fr: "Noir lavé", ar: "أسود مغسول" }],
    stock: 14,
    image: "/products/hoodie-night.jpg",
  },
  {
    id: "signal-puffer",
    category: "jackets",
    name: { fr: "Doudoune Signal", ar: "جاكت سيجنال المنتفخ" },
    description: {
      fr: "Doudoune graphique noir et rose, volume court et nylon brillant.",
      ar: "جاكت منتفخ بطبعة وردية، حجم قصير ونايلون لامع.",
    },
    price: 24600,
    sizes: ["S", "M", "L", "XL"],
    colors: [{ fr: "Noir / rose", ar: "أسود / وردي" }],
    stock: 5,
    image: "/products/signal-puffer.jpg",
  },
  {
    id: "archive-shell",
    category: "jackets",
    name: { fr: "Veste Archive", ar: "جاكيت أرشيف" },
    description: {
      fr: "Coque boxy noire, tombé carré et fermeture haute.",
      ar: "جاكيت أسود بقصة مربعة وإغلاق عالٍ.",
    },
    price: 21900,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ fr: "Noir", ar: "أسود" }],
    stock: 6,
    image: "/products/jacket-archive.jpg",
  },
  {
    id: "column-cargo",
    category: "cargo",
    name: { fr: "Cargo Column", ar: "بنطال كارجو كولوم" },
    description: {
      fr: "Pantalon cargo ample, poches basses et pli technique.",
      ar: "بنطال كارجو واسع، جيوب منخفضة وطية تقنية.",
    },
    price: 16800,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [{ fr: "Noir", ar: "أسود" }],
    stock: 11,
    image: "/products/cargo-column.jpg",
  },
  {
    id: "mass-tee",
    category: "tees",
    name: { fr: "T-shirt boxy Mass", ar: "تيشيرت ماس البوكسي" },
    description: {
      fr: "T-shirt lourd à coupe boxy, coton dense et col réduit.",
      ar: "تيشيرت ثقيل بقصة مربعة، قطن كثيف وياقة ضيقة.",
    },
    price: 7900,
    sizes: ["S", "M", "L", "XL", "XXL"],
    colors: [
      { fr: "Noir", ar: "أسود" },
      { fr: "Encre", ar: "حبري" },
    ],
    stock: 20,
    image: "/products/tee-mass.jpg",
  },
];

export function getProduct(id) {
  return products.find((product) => product.id === id);
}

export function formatPrice(amount, language) {
  const value = new Intl.NumberFormat("fr-DZ", {
    maximumFractionDigits: 0,
  }).format(amount);
  return language === "ar" ? `${value} د.ج` : `${value} DA`;
}
