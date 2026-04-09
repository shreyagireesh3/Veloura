import React from 'react';
import { motion } from 'motion/react';
import { PRODUCTS, Product } from '../types';

const VelouraLogo = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="logo-grad-small" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#fbcfe8" />
        <stop offset="50%" stopColor="#db2777" />
        <stop offset="100%" stopColor="#9d174d" />
      </linearGradient>
    </defs>
    <path d="M35 30C35 20 45 15 50 15C55 15 65 20 65 30" stroke="#fbbf24" strokeWidth="4" strokeLinecap="round" />
    <path d="M35 80C35 80 30 78 28 75C25 70 28 65 30 62C32 59 25 58 23 54C21 50 25 45 28 42C31 39 30 35 35 30H75C80 30 85 35 85 40V70C85 75 80 80 75 80H35Z" fill="url(#logo-grad-small)" />
    <rect x="70" y="45" width="12" height="18" rx="2" transform="rotate(15 70 45)" fill="#fbbf24" />
  </svg>
);

interface ProductListProps {
  onProductClick: (product: Product) => void;
}

export default function ProductList({ onProductClick }: ProductListProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-12">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-veloura-accent mb-2">
          <VelouraLogo size={24} />
          <span className="text-sm font-medium uppercase tracking-widest">Curated Selection</span>
        </div>
        <h1 className="text-4xl font-serif font-bold">The Veloura Edit</h1>
        <p className="text-gray-500 mt-2">Discover pieces designed to elevate your everyday.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {PRODUCTS.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onProductClick(product)}
            className="group cursor-pointer"
          >
            <div className="aspect-[3/4] rounded-3xl overflow-hidden glass mb-4 relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-veloura-ink/0 group-hover:bg-veloura-ink/5 transition-colors" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-veloura-accent uppercase tracking-wider">
                {product.category}
              </span>
              <h3 className="font-serif font-bold text-lg group-hover:text-veloura-accent transition-colors">
                {product.name}
              </h3>
              <p className="text-gray-600 font-medium">{formatPrice(product.price)}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
