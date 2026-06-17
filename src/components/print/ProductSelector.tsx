"use client";

const products = [
  {
    type: "book",
    name: "Poetry Book",
    icon: "📖",
    description: "A beautifully bound book of your collection",
  },
  {
    type: "poster",
    name: "Poster",
    icon: "🖼️",
    description: "High-quality print on premium paper",
  },
  {
    type: "frame",
    name: "Framed Print",
    icon: "🪟",
    description: "Elegant frame with your favorite poem",
  },
  {
    type: "canvas",
    name: "Canvas",
    icon: "🎨",
    description: "Gallery-quality canvas print",
  },
  {
    type: "mug",
    name: "Mug",
    icon: "☕",
    description: "Start your day with your own words",
  },
  {
    type: "tshirt",
    name: "T-Shirt",
    icon: "👕",
    description: "Wear your poetry proudly",
  },
];

interface ProductSelectorProps {
  selected: string;
  onSelect: (type: string) => void;
}

export function ProductSelector({ selected, onSelect }: ProductSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {products.map((product) => (
        <button
          key={product.type}
          type="button"
          onClick={() => onSelect(product.type)}
          className={`p-4 rounded-xl border-2 text-left transition-all duration-200 ${
            selected === product.type
              ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-500 shadow-sm"
              : "border-warm-200 dark:border-dark-600 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-warm-50 dark:hover:bg-dark-700"
          }`}
        >
          <span className="text-2xl block mb-2">{product.icon}</span>
          <p className="font-semibold text-sm text-primary-800 dark:text-dark-100">{product.name}</p>
          <p className="text-xs text-primary-400 dark:text-dark-400 mt-0.5">{product.description}</p>
        </button>
      ))}
    </div>
  );
}
