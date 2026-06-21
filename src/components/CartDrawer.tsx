/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, Trash2, ShoppingBag, Lock, Sparkles, CreditCard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartDrawerOpen,
    setCartDrawerOpen,
    updateCartQuantity,
    removeFromCart,
    setNavPage,
    user,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useApp();

  const [promoCode, setPromoCode] = useState('');

  const cartCount = cart.reduce((tot, item) => tot + item.quantity, 0);
  const cartSubtotal = cart.reduce((tot, item) => tot + item.product.price * item.quantity, 0);
  
  // High-end calculated variables
  const discountVal = appliedCoupon
    ? appliedCoupon.type === 'percentage'
      ? (cartSubtotal * appliedCoupon.value) / 100
      : appliedCoupon.value
    : 0;

  const totalVal = Math.max(0, cartSubtotal - discountVal);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    applyCoupon(promoCode);
    setPromoCode('');
  };

  const handleProceedToSettle = () => {
    setCartDrawerOpen(false);
    setNavPage('checkout');
    window.scrollTo({ top: 300, behavior: 'smooth' });
  };

  return (
    <AnimatePresence>
      {cartDrawerOpen && (
        <div id="cart_drawer_mask" className="fixed inset-0 z-110 overflow-hidden font-display">
          {/* Backdrop blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.55 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartDrawerOpen(false)}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
          />

          {/* Drawer container body */}
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="w-screen max-w-md bg-stone-950 text-white shadow-2xl flex flex-col border-l border-white/5 relative"
            >
              {/* Gold light leak effect on top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-600 via-[#C5A059] to-gold-400 z-10" />

              {/* Drawer Header */}
              <div className="px-6 py-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gold-500/10 border border-[#C5A059]/30 flex items-center justify-center text-gold-400">
                    <ShoppingBag size={14} />
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-widest text-[#C5A059]">Bespoke Case</h2>
                    <p className="text-[10px] text-stone-500 uppercase tracking-wider font-mono font-medium mt-0.5">
                      {cartCount} {cartCount === 1 ? 'masterpiece' : 'masterpieces'} allocation
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setCartDrawerOpen(false)}
                  className="rounded-full bg-stone-900 border border-white/10 hover:border-[#C5A059] p-2 hover:bg-[#C5A059] hover:text-black text-stone-300 transition-all cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cart.length > 0 ? (
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-4 p-3.5 bg-stone-900/40 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-[#C5A059]/30 transition-all"
                      >
                        {/* Interactive thumbnail */}
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-xl bg-stone-950 shrink-0 border border-white/5 group-hover:scale-103 transition-transform"
                        />

                        {/* Text meta */}
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="text-[8px] tracking-widest text-[#C5A059] font-mono uppercase font-bold">
                                {item.product.category}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="text-stone-500 hover:text-rose-400 transition-colors p-0.5"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                            <h4 className="font-semibold text-xs text-white uppercase tracking-wider truncate mt-0.5">
                              {item.product.name}
                            </h4>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                            {/* Quantity controller */}
                            <div className="flex items-center gap-1.5 bg-stone-950/60 border border-white/5 rounded-full p-0.5">
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 text-stone-300 hover:text-white transition-all text-xs"
                              >
                                <Minus size={8} />
                              </button>
                              <span className="text-[10px] font-mono font-bold w-4 text-center text-stone-200">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                                className="w-5 h-5 rounded-full flex items-center justify-center hover:bg-white/10 text-stone-300 hover:text-white transition-all text-xs"
                              >
                                <Plus size={8} />
                              </button>
                            </div>

                            {/* Pricings */}
                            <span className="text-xs font-mono font-bold text-white">
                              ${(item.product.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-full flex flex-col justify-center items-center text-center space-y-4 max-w-xs mx-auto py-12">
                    <div className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-stone-500 bg-stone-900/40">
                      <ShoppingBag size={20} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white tracking-widest uppercase">No Allocations Logged</h3>
                      <p className="text-[10px] text-stone-500 leading-relaxed uppercase tracking-wider mt-1.5">
                        Your luxury portfolio is empty. Venture into our limited lists to lock in assets.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setCartDrawerOpen(false);
                        setNavPage('shop');
                      }}
                      className="bg-[#C5A059] hover:bg-[#D4B57A] text-black py-2.5 px-6 rounded-full text-[10px] tracking-widest uppercase font-bold cursor-pointer transition-transform duration-300 hover:scale-102"
                    >
                      Gallery Listings
                    </button>
                  </div>
                )}
              </div>

              {/* Drawer Footer calculations */}
              {cart.length > 0 && (
                <div className="border-t border-white/5 bg-stone-950/80 backdrop-blur-md p-6 space-y-4">
                  
                  {/* Promo Coupons */}
                  {appliedCoupon ? (
                    <div className="flex items-center justify-between p-2 rounded-xl bg-gold-500/10 border border-[#C5A059]/20 text-xs">
                      <div className="flex items-center gap-1.5">
                        <Sparkles size={11} className="text-[#C5A059]" />
                        <span className="font-mono text-[10px] uppercase font-bold text-[#C5A059]">
                          {appliedCoupon.code} Applied
                        </span>
                      </div>
                      <button
                        onClick={removeCoupon}
                        className="text-[9px] text-[#C5A059] hover:underline uppercase font-bold font-mono tracking-wider"
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2.5">
                      <input
                        type="text"
                        placeholder="ENTER VOUCHER CODE..."
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        className="flex-1 bg-stone-900/60 border border-white/10 focus:border-[#C5A059]/60 rounded-full px-4 py-2 text-[10px] tracking-widest font-mono text-white placeholder-stone-500 uppercase focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="bg-stone-900 hover:bg-[#C5A059]/10 text-stone-200 border border-white/15 hover:border-[#C5A059] hover:text-[#C5A059] px-5 py-2 rounded-full text-[9px] tracking-widest uppercase font-bold cursor-pointer transition-all"
                      >
                        Apply
                      </button>
                    </form>
                  )}

                  {/* Calculations Sheet */}
                  <div className="space-y-2 border-b border-white/5 pb-4">
                    <div className="flex justify-between text-xs text-stone-400">
                      <span className="uppercase tracking-wider">Subtotal</span>
                      <span className="font-mono font-semibold">${cartSubtotal.toLocaleString()}</span>
                    </div>

                    {appliedCoupon && (
                      <div className="flex justify-between text-xs text-[#C5A059]">
                        <span className="uppercase tracking-wider">Golden Reward Benefit</span>
                        <span className="font-mono font-semibold">-${discountVal.toLocaleString()}</span>
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs uppercase font-bold tracking-widest text-[#C5A059]">Bespoke Total</span>
                      <span className="font-mono text-lg font-extrabold text-[#C5A059]">${totalVal.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Checkout buttons */}
                  <div className="space-y-2.5">
                    <button
                      onClick={handleProceedToSettle}
                      className="w-full bg-[#C5A059] hover:bg-[#D4B57A] text-black font-display text-xs font-bold uppercase tracking-widest rounded-full py-4 transition-all shadow-lg shadow-[#C5A059]/10 hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Lock size={12} /> Secure Settlement
                    </button>
                    
                    <button
                      onClick={() => setCartDrawerOpen(false)}
                      className="w-full bg-transparent hover:bg-white/5 text-stone-400 hover:text-white border border-white/10 hover:border-white/20 py-3 rounded-full text-[10px] tracking-widest uppercase font-bold cursor-pointer transition-all"
                    >
                      Continue Customizing
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
