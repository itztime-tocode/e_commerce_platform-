/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp, PageId } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Footer } from './components/Footer';
import { ProductCard } from './components/ProductCard';
import { AuthModal } from './components/AuthModal';
import { CheckoutFlow } from './components/CheckoutFlow';
import { OrderTimeline } from './components/OrderTimeline';
import { AdminConsole } from './components/AdminConsole';
import { CartDrawer } from './components/CartDrawer';
import { 
  ShoppingBag, ShieldCheck, ArrowRight, Eye, Sparkles, Filter, 
  Trash2, Plus, Minus, CreditCard, ChevronRight, Lock, Clock, MapPin, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const {
    user,
    cart,
    wishlist,
    navPage,
    setNavPage,
    catalogProducts,
    categories,
    selectedProduct,
    setSelectedProduct,
    searchQuery,
    setSearchQuery,
    loadProductCatalog,
    updateCartQuantity,
    removeFromCart,
    orders,
    loadOrders,
    alert,
    triggerAlert
  } = useApp();

  const [authOpen, setAuthOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortOption, setSortOption] = useState<'featured' | 'low-high' | 'high-low' | 'rating'>('featured');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Load catalog on start
  useEffect(() => {
    loadProductCatalog();
  }, []);

  // Sync user orders if logged in
  useEffect(() => {
    if (user) {
      loadOrders();
    }
  }, [user]);

  // Filter items in Shop list
  const filteredProducts = catalogProducts.filter(p => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesQuery = !searchQuery.trim() || 
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Sort items in Shop list
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortOption === 'low-high') return a.price - b.price;
    if (sortOption === 'high-low') return b.price - a.price;
    if (sortOption === 'rating') return b.rating - a.rating;
    return 0; // featured/default fallback ID order
  });

  const cartSubtotal = cart.reduce((tot, item) => tot + item.product.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-[#C5A059] selection:text-black flex flex-col justify-between overflow-x-hidden antialiased">
      
      {/* Dynamic Floating Global Alert bar */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-60 max-w-sm w-full px-4"
          >
            <div className={`p-4 rounded-2xl shadow-2xl border text-center text-xs font-display flex items-center justify-center gap-2.5 ${
              alert.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : alert.type === 'error'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  : 'bg-stone-900 border-gold-500/35 text-gold-400'
            }`}>
              <Sparkles size={14} className="shrink-0 animate-spin" />
              <span className="font-semibold tracking-wide leading-tight">{alert.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Header navigation */}
      <Navbar onOpenAuth={() => setAuthOpen(true)} />

      {/* Auth Gate overlays */}
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      {/* Bespoke Interactive Sliding Cart Drawer */}
      <CartDrawer />

      {/* Dynamic Content Canvas with route transitions */}
      <main className="flex-grow pt-20">
        <AnimatePresence mode="wait">
          
          {/* NAV ID: HOME */}
          {navPage === 'home' && (
            <motion.div
              key="page_home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-16"
            >
              {/* Dynamic Slideshow */}
              <Hero />

              {/* Curated Division categories scrolling row */}
              <section className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="text-center md:text-left space-y-1.5 mb-8">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] font-mono">Curated Collections</span>
                  <h2 className="text-3xl font-light text-white leading-tight font-extralight tracking-tight">Luxury Divisions</h2>
                  <p className="text-[11px] text-stone-500 uppercase tracking-widest font-display">Crafting the standard of modern luxury across select high-end divisions</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.slug);
                        setNavPage('shop');
                        window.scrollTo({ top: 300, behavior: 'smooth' });
                      }}
                      className="group cursor-pointer relative h-80 rounded-3xl overflow-hidden bg-black shadow-xl border border-white/5"
                    >
                      {/* Photo backdrop */}
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:rotate-1 opacity-60 group-hover:opacity-85"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                      
                      {/* Bottom textual call */}
                      <div className="absolute bottom-6 left-6 space-y-2">
                        <span className="text-[9px] text-[#C5A059] font-mono uppercase font-bold leading-none tracking-widest block">Collection</span>
                        <h3 className="font-display text-lg text-white font-semibold uppercase tracking-wider">{cat.name}</h3>
                        <p className="text-[10px] text-stone-400 font-light leading-relaxed max-w-[200px] line-clamp-2">
                          {cat.description}
                        </p>
                        <span className="text-[10px] text-gold-400 font-bold uppercase tracking-widest flex items-center gap-1.5 pt-2 font-display opacity-0 group-hover:opacity-100 transition-opacity">
                          Acquire Specs <ArrowRight size={10} />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Curated Showcases - featured items */}
              <section className="max-w-7xl mx-auto px-6 md:px-12 bg-stone-950/20 py-12 rounded-3xl border border-white/5 space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="text-center md:text-left space-y-1.5">
                    <span className="text-[10px] uppercase font-bold tracking-widest text-[#C5A059] font-mono">Bespoke Curation</span>
                    <h2 className="text-2xl md:text-3xl text-white font-medium tracking-tight mt-1">Masterpiece Acquisitions</h2>
                    <p className="text-[11px] text-stone-500 uppercase tracking-widest font-display">Handcrafted and tailored with authenticity guarantees</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setNavPage('shop');
                      window.scrollTo({ top: 300, behavior: 'smooth' });
                    }}
                    className="border border-white/10 hover:border-[#C5A059] text-stone-300 hover:text-white rounded-full py-3.5 px-8 font-display text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer bg-black/40 hover:bg-[#C5A059]/10"
                  >
                    View Entire Catalog
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {catalogProducts.slice(0, 3).map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              </section>

              {/* Tesla/Rolex Style Editorial Hero Block */}
              <section className="relative h-[65vh] w-full bg-cover bg-center flex items-center justify-center font-display overflow-hidden" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=1600')` }}>
                <div className="absolute inset-0 bg-black/80" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
                <div className="relative z-10 text-center max-w-2xl px-6 space-y-4">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 font-mono flex items-center justify-center gap-1 leading-none">
                    <ShieldCheck size={11} /> Verified Heritage Files
                  </span>
                  <h2 className="text-3xl md:text-4xl text-white font-light tracking-tight leading-tight uppercase">Meticulous Standards</h2>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    Every luxury asset curated inside LUXORA catalog passes dynamic authenticity protocols overseen by master horologists, elite shipbuilders, and certified designers.
                  </p>
                  <button
                    onClick={() => {
                      setNavPage('shop');
                      window.scrollTo({ top: 400, behavior: 'smooth' });
                    }}
                    className="bg-white/5 hover:bg-[#C5A059] text-[#C5A059] hover:text-black border border-[#C5A059]/35 hover:border-[#C5A059] text-[10px] uppercase font-bold tracking-widest rounded-full py-3.5 px-8 transition-colors cursor-pointer"
                  >
                    Audited Portfolios
                  </button>
                </div>
              </section>

            </motion.div>
          )}

          {/* NAV ID: SHOP */}
          {navPage === 'shop' && (
            <motion.div
              key="page_shop"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-7xl mx-auto px-6 md:px-12 space-y-10 py-10"
            >
              {/* Header Title */}
              <div className="text-center md:text-left space-y-2">
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold font-mono">LUXURY DISPATCH GALLERY</span>
                <h1 className="text-3xl md:text-4xl text-white font-medium tracking-tight">Curation Registry</h1>
                <p className="text-xs text-stone-500 uppercase tracking-widest">Acquire handpicked items featuring secure direct transit delivery mechanics</p>
              </div>

              {/* Dynamic Categories Selection rail + Filter Bar */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/5 pb-4">
                
                {/* Category selectors */}
                <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-widest font-bold">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`rounded-full py-2 px-5 transition-all cursor-pointer ${
                      selectedCategory === 'all'
                        ? 'bg-gold-500 text-black font-extrabold shadow-lg shadow-gold-500/10'
                        : 'border border-white/10 text-stone-300 hover:text-white hover:bg-stone-900/60'
                    }`}
                  >
                    All Masterpieces
                  </button>
                  {categories.map(c => (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCategory(c.slug)}
                      className={`rounded-full py-2 px-5 transition-all cursor-pointer ${
                        selectedCategory === c.slug
                          ? 'bg-gold-500 text-black font-extrabold shadow-lg shadow-gold-500/10'
                          : 'border border-white/10 text-stone-400 hover:text-white hover:bg-stone-900/60'
                      }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>

                {/* Pricing / rating sorted filter dropdown */}
                <div className="flex items-center gap-2.5 bg-stone-900/40 border border-white/5 rounded-full py-1.5 px-3">
                  <Filter size={11} className="text-[#C5A059]" />
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="bg-transparent text-stone-300 font-display text-[10px] uppercase font-bold tracking-wider hover:text-white focus:outline-none cursor-pointer"
                  >
                    <option value="featured">Featured Order</option>
                    <option value="low-high">Acquisition price: Low to High</option>
                    <option value="high-low">Acquisition price: High to Low</option>
                    <option value="rating">Top Feedback Rating</option>
                  </select>
                </div>

              </div>

              {/* Products Grid */}
              {sortedProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {sortedProducts.map((p) => (
                    <ProductCard key={p.id} product={p} />
                  ))}
                </div>
              ) : (
                <div className="h-96 flex flex-col justify-center items-center text-center space-y-4 max-w-sm mx-auto">
                  <div className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-stone-500">
                    <ShoppingBag size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">No Assets Matches Spec</h3>
                    <p className="text-xs text-stone-500 leading-relaxed mt-1">Our dynamic search algorithms couldn't isolate any items with active query metrics.</p>
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    className="bg-stone-900 hover:bg-stone-850 text-gold-400 py-2.5 px-5 rounded-full text-xs font-semibold hover:text-white border border-white/5 cursor-pointer"
                  >
                    Reset Filter Search
                  </button>
                </div>
              )}

            </motion.div>
          )}

          {/* NAV ID: CART */}
          {navPage === 'cart' && (
            <motion.div
              key="page_cart"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto px-6 py-12 space-y-8"
            >
              <div className="text-center md:text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold font-mono">YOUR LUXURY CASE</span>
                <h1 className="text-2xl md:text-3xl text-white font-medium mt-1">Acquisition Bag</h1>
              </div>

              {cart.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                  
                  {/* Cart Materials list column */}
                  <div className="lg:col-span-2 space-y-4">
                    {cart.map((item) => (
                      <div 
                        key={item.product.id}
                        className="glass-card p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center gap-5 relative overflow-hidden"
                      >
                        <img src={item.product.images[0]} alt={item.product.name} className="w-20 h-20 object-cover rounded-xl bg-stone-950 shrink-0" />
                        
                        <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
                          <span className="text-[9px] text-[#C5A059] font-mono uppercase font-bold leading-none tracking-widest block">Collection</span>
                          <h4 className="font-semibold text-white text-base truncate">{item.product.name}</h4>
                          <p className="text-xs text-stone-400 font-mono font-semibold">${item.product.price.toLocaleString()}</p>
                        </div>

                        {/* Adjust Qty widgets */}
                        <div className="flex items-center gap-3 bg-stone-950/40 p-1 border border-white/5 rounded-xl shrink-0">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-white p-1 rounded-lg cursor-pointer"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-mono text-white text-center w-6 font-bold">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-gold-400 p-1 rounded-lg cursor-pointer"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        {/* Total billing price per item */}
                        <div className="min-w-[80px] text-right font-mono text-sm font-bold text-white hidden sm:block">
                          ${(item.product.price * item.quantity).toLocaleString()}
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Summary Sidebar card */}
                  <div className="glass-card p-6 rounded-3xl space-y-5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/5 blur-2xl rounded-full" />
                    <h3 className="text-xs uppercase tracking-widest text-[#C5A059] border-b border-white/5 pb-2 font-bold leading-none">Bag Summary</h3>
                    
                    <div className="space-y-3.5 text-xs">
                      <div className="flex justify-between text-stone-400">
                        <span>Items Cart valuation:</span>
                        <span className="font-mono text-white font-bold">${cartSubtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-stone-400">
                        <span>Vault Surcharge (EST):</span>
                        <span className="font-mono text-white font-bold">8.25%</span>
                      </div>
                      <div className="flex justify-between pb-3 border-b border-white/5 text-stone-400">
                        <span>Complimentary delivery:</span>
                        <span className="text-gold-400 uppercase tracking-widest font-mono font-bold leading-none">Verified</span>
                      </div>
                      <div className="flex justify-between font-bold text-sm">
                        <span className="text-white">Subtotal quote:</span>
                        <span className="text-gold-400 font-mono">${cartSubtotal.toLocaleString()}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        if (!user) {
                          setAuthOpen(true);
                          triggerAlert('Complete personal security credentials log first.', 'info');
                        } else {
                          setNavPage('checkout');
                        }
                      }}
                      className="w-full bg-[#C5A059] hover:bg-[#D4B57A] text-black font-display text-xs font-bold uppercase tracking-widest rounded-full py-4 transition-all shadow-lg hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer mt-4"
                    >
                      <Lock size={12} /> Proceed to Secure Settle
                    </button>
                  </div>

                </div>
              ) : (
                <div className="h-96 flex flex-col justify-center items-center text-center space-y-4 max-w-sm mx-auto">
                  <div className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center text-stone-500 bg-stone-900/40">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white tracking-tight">Your Acquisition Case is Empty</h3>
                    <p className="text-xs text-stone-500 leading-relaxed mt-1">Explore our vetted collection segments to secure exquisite assets and schedule dispatch.</p>
                  </div>
                  <button
                    onClick={() => setNavPage('shop')}
                    className="bg-[#C5A059] hover:bg-[#D4B57A] text-black py-3 px-6 rounded-full text-xs tracking-widest uppercase font-bold transition-transform cursor-pointer"
                  >
                    Go to Gallery Listings
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* NAV ID: CHECKOUT (Multi-Step modular flow) */}
          {navPage === 'checkout' && (
            <motion.div
              key="page_checkout"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CheckoutFlow />
            </motion.div>
          )}

          {/* NAV ID: ORDERS HISTORY & PROGRESS TIMELINE */}
          {navPage === 'orders' && (
            <motion.div
              key="page_orders"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="max-w-4xl mx-auto px-6 py-12 space-y-8"
            >
              <div className="text-center md:text-left">
                <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold font-mono">CLIENT PROFILE DATA</span>
                <h1 className="text-2xl md:text-3xl text-white font-medium mt-1">Acquisition Log & Progress</h1>
                <p className="text-xs text-stone-500 uppercase tracking-widest font-display">Inspect transit routes, tracking numbers, and handover estimations</p>
              </div>

              {orders.length > 0 ? (
                <div className="space-y-6">
                  {orders.map((ord) => (
                    <div 
                      key={ord.id}
                      className="glass-card rounded-3xl border border-white/5 overflow-hidden p-6 space-y-6"
                    >
                      {/* Order top specs summary card */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-stone-950/40 p-4 rounded-2xl border border-white/5">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-xs flex-1">
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-stone-500 font-mono font-bold block">Invoice ID</span>
                            <span className="font-mono text-white font-bold tracking-tight truncate max-w-[120px] block">{ord.id}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-stone-500 font-mono font-bold block">Invoiced Date</span>
                            <span className="text-stone-300 font-medium">{new Date(ord.createdAt).toLocaleDateString()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-stone-500 font-mono font-bold block">Settle amount</span>
                            <span className="text-gold-400 font-mono font-bold">${ord.total.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[9px] uppercase tracking-widest text-stone-500 font-mono font-bold block">Arrival ETA</span>
                            <span className="text-stone-300 font-medium">{new Date(ord.estimatedDelivery).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* Tracker toggler button */}
                        <button
                          onClick={() => setExpandedOrder(expandedOrder === ord.id ? null : ord.id)}
                          className="flex items-center gap-1.5 border border-[#C5A059]/40 hover:bg-[#C5A059] hover:text-black py-2 px-4 rounded-full font-display text-[9px] uppercase font-bold tracking-widest text-gold-400 transition-all cursor-pointer whitespace-nowrap self-end sm:self-center"
                        >
                          <Clock size={11} /> 
                          {expandedOrder === ord.id ? 'Collapse Transit Route' : 'Track Dynamic Route'}
                        </button>
                      </div>

                      {/* Expanding Timeline tracker progress block */}
                      <AnimatePresence>
                        {expandedOrder === ord.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="overflow-hidden border-t border-white/5 pt-6 space-y-6"
                          >
                            <h4 className="text-[10px] uppercase font-display tracking-widest text-[#C5A059] font-bold">Dynamic Courier Progress log</h4>
                            <OrderTimeline status={ord.trackingStatus} />
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Items loop details in order */}
                      <div className="space-y-3.5 border-t border-white/5 pt-4">
                        <h4 className="text-[9px] uppercase tracking-widest text-stone-500 font-mono font-bold">Authenticated items package</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {ord.items.map((it) => (
                            <div key={it.product.id} className="flex gap-3 items-center p-2.5 bg-stone-950/20 border border-white/5 rounded-xl">
                              <img src={it.product.images[0]} alt={it.product.name} className="w-10 h-10 object-cover rounded-lg" />
                              <div className="min-w-0 flex-1">
                                <span className="text-[8px] text-[#C5A059] uppercase font-bold font-mono tracking-wide leading-none">{it.product.category}</span>
                                <h5 className="text-white text-xs font-semibold truncate leading-tight">{it.product.name}</h5>
                                <span className="text-[10px] text-stone-400 font-mono">{it.quantity} x ${it.product.price.toLocaleString()}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-96 flex flex-col justify-center items-center text-center space-y-4 max-w-sm mx-auto">
                  <div className="w-14 h-14 rounded-full border border-white/5 flex items-center justify-center text-stone-500 bg-stone-900/40">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white tracking-tight">No Active Authentications Filed</h3>
                    <p className="text-xs text-stone-500 leading-relaxed mt-1">If you have recently transacted acquisitions, they will take 5-10 seconds to sync inside our secure vault registers.</p>
                  </div>
                  <button
                    onClick={() => setNavPage('shop')}
                    className="bg-[#C5A059] hover:bg-[#D4B57A] text-black py-3 px-6 rounded-full text-xs tracking-widest uppercase font-bold transition-transform cursor-pointer"
                  >
                    Investigate Masterpieces
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {/* NAV ID: ADMIN (Stripe style Admin stats/inventories CRUD) */}
          {navPage === 'admin' && (
            <motion.div
              key="page_admin"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {user?.role === 'admin' ? (
                <AdminConsole />
              ) : (
                <div className="min-h-[80vh] flex flex-col items-center justify-center text-center p-6 space-y-4 max-w-sm mx-auto font-display">
                  <X className="text-rose-500 shrink-0" size={36} />
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">Access Blocked</h3>
                  <p className="text-xs text-stone-400 leading-relaxed font-light">
                    You do not hold executive certificates to inspect administrative ledger trends. Please authenticate as an "Executive Administrator" profile.
                  </p>
                  <button 
                    onClick={() => {
                      setAuthOpen(true);
                    }}
                    className="bg-gold-500 text-black py-2.5 px-6 rounded-full text-xs uppercase font-extrabold tracking-widest"
                  >
                    Authenticate Executive
                  </button>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Footer link mapping */}
      <Footer />
    </div>
  );
}
