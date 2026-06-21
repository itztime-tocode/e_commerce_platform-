/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Product } from '../types';
import { useApp } from '../context/AppContext';
import { Heart, Star, Eye, ShoppingCart, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, toggleWishlist, isInWishlist, viewProductDetails } = useApp();
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const favorited = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product);
  };

  return (
    <>
      <motion.div
        whileHover={{ y: -6 }}
        className="glass-card glass-card-hover rounded-3xl overflow-hidden shadow-xl aspect-auto flex flex-col group relative transition-all duration-300"
      >
        {/* Hover/Zoom Photo Canvas */}
        <div 
          onClick={() => viewProductDetails(product.id)}
          className="relative aspect-square w-full bg-stone-950 overflow-hidden cursor-pointer"
        >
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
            referrerPolicy="no-referrer"
          />

          {/* Golden glow mask overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-65 group-hover:opacity-80 transition-opacity" />

          {/* Quick-action widgets */}
          <div className="absolute top-4 right-4 flex flex-col gap-2.5 translate-x-12 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300 ease-out">
            <button
              onClick={handleToggleFavorite}
              className="w-9 h-9 bg-black/70 hover:bg-gold-500 hover:text-black text-stone-300 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md cursor-pointer"
            >
              <Heart size={14} className={favorited ? 'fill-gold-500 stroke-gold-500 text-black' : ''} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="w-9 h-9 bg-black/70 hover:bg-gold-500 hover:text-black text-stone-300 rounded-full flex items-center justify-center backdrop-blur-md transition-all shadow-md cursor-pointer"
            >
              <Eye size={14} />
            </button>
          </div>

          {/* Low Stock alert banner */}
          {product.inventory <= 5 && product.inventory > 0 && (
            <div className="absolute bottom-4 left-4 bg-amber-500/10 border border-amber-500/20 text-amber-400 font-display text-[9px] uppercase tracking-widest px-2.5 py-1 rounded-full backdrop-blur-md font-bold">
              Only {product.inventory} pieces left
            </div>
          )}

          {product.inventory === 0 && (
            <div className="absolute inset-0 bg-black/85 flex items-center justify-center backdrop-blur-sm z-10">
              <span className="font-display text-xs text-[#C5A059] uppercase tracking-widest font-bold border border-[#C5A059]/40 rounded-full px-5 py-2">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Meta */}
        <div 
          onClick={() => viewProductDetails(product.id)}
          className="p-5 flex-1 flex flex-col justify-between cursor-pointer"
        >
          <div className="space-y-1.5">
            <div className="flex justify-between items-start gap-2">
              <p className="font-display text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">
                {product.category}
              </p>
              <div className="flex items-center gap-1 font-mono text-[10px] text-stone-400">
                <Star size={10} className="fill-gold-400 stroke-gold-400 text-gold-400" />
                <span>{product.rating}</span>
                <span className="opacity-50">({product.reviewsCount})</span>
              </div>
            </div>

            <h3 className="font-display text-sm md:text-base text-white font-medium tracking-tight group-hover:text-gold-400 transition-colors line-clamp-1">
              {product.name}
            </h3>
            
            <p className="text-xs text-stone-400 tracking-wide font-light line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-4">
            <span className="font-mono text-base md:text-lg font-bold text-white">
              ${product.price.toLocaleString()}
            </span>

            {product.inventory > 0 && (
              <button
                onClick={handleQuickAdd}
                className="flex items-center gap-1.5 border border-[#C5A059]/30 hover:bg-[#C5A059] hover:border-[#C5A059] hover:text-black py-1.5 px-3.5 rounded-full font-display text-[10px] uppercase font-bold tracking-wider text-white hover:scale-105 transition-all cursor-pointer"
              >
                <ShoppingCart size={11} />
                Acquire
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* QUICK VIEW DIALOG OVERLAY */}
      <AnimatePresence>
        {quickViewOpen && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.85 }}
              exit={{ opacity: 0 }}
              onClick={() => setQuickViewOpen(false)}
              className="absolute inset-0 bg-black"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="relative w-full max-w-4xl bg-stone-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl z-20 flex flex-col md:flex-row max-h-[90vh] md:max-h-auto overflow-y-auto"
            >
              <button
                onClick={() => setQuickViewOpen(false)}
                className="absolute top-4 right-4 text-stone-400 hover:text-white bg-black/40 hover:bg-stone-800 rounded-full p-2 transition-colors z-30 cursor-pointer"
              >
                <X size={16} />
              </button>

              <div className="w-full md:w-1/2 bg-stone-950 aspect-square md:aspect-auto">
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div>
                    <span className="font-display text-[10px] uppercase tracking-widest text-[#C5A059] font-bold">
                      {product.category}
                    </span>
                    <h2 className="font-display text-2xl text-white font-medium tracking-tight mt-1">
                      {product.name}
                    </h2>
                    <div className="flex items-center gap-1.5 mt-2 font-mono text-xs text-stone-300">
                      <Star size={12} className="fill-gold-400 stroke-gold-400 text-gold-400" />
                      <span>{product.rating} Stars</span>
                      <span className="opacity-50">| {product.reviewsCount} private feedback reports</span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-300 font-light leading-relaxed">
                    {product.description}
                  </p>

                  {/* Quick specs selection */}
                  {product.specs && product.specs.length > 0 && (
                    <div className="border-t border-white/5 pt-4 space-y-1">
                      <h4 className="text-[10px] uppercase font-display tracking-widest text-stone-500 font-bold">
                        Exquisite Specs
                      </h4>
                      <div className="grid grid-cols-2 gap-2 p-1 bg-stone-950/40 rounded-xl">
                        {product.specs.slice(0, 4).map((spec, sIdx) => (
                          <div key={sIdx} className="p-2">
                            <span className="block text-[8px] uppercase tracking-wider text-stone-500 font-mono">
                              {spec.name}
                            </span>
                            <span className="block text-[10px] text-stone-300 truncate">
                              {spec.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-6 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase tracking-widest text-stone-500 font-mono">Curated Price</span>
                    <span className="font-mono text-2xl font-bold text-white">
                      ${product.price.toLocaleString()}
                    </span>
                  </div>

                  {product.inventory > 0 ? (
                    <button
                      onClick={(e) => {
                        handleQuickAdd(e);
                        setQuickViewOpen(false);
                      }}
                      className="bg-gold-500 hover:bg-gold-400 text-black font-display text-xs font-bold tracking-widest uppercase hover:scale-105 rounded-full py-4 px-8 shadow-lg transition-all cursor-pointer"
                    >
                      Acquire Now
                    </button>
                  ) : (
                    <span className="text-xs text-stone-500 uppercase tracking-widest font-bold">
                      Sold Out
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
