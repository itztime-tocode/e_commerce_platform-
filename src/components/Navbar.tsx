/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp, PageId } from '../context/AppContext';
import { Search, ShoppingBag, User as UserIcon, Heart, LogOut, Settings, Clock, X, ChevronRight, Menu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const {
    user,
    cart,
    wishlist,
    navPage,
    setNavPage,
    logout,
    searchQuery,
    setSearchQuery,
    searchHistory,
    loadSearchHistory,
    loadProductCatalog,
    catalogProducts,
    viewProductDetails,
    triggerAlert,
    setCartDrawerOpen
  } = useApp();

  const [searchFocused, setSearchFocused] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((tot, item) => tot + item.quantity, 0);

  // Filter dynamic suggestions based on catalog items
  const suggestions = searchQuery.trim()
    ? catalogProducts.filter(p => 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 4)
    : [];

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchFocused(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', clickOutside);
    return () => document.removeEventListener('mousedown', clickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchFocused(false);
    setNavPage('shop');
    loadProductCatalog();
  };

  const handleSuggestionClick = (prodId: string) => {
    setSearchFocused(false);
    viewProductDetails(prodId);
  };

  const handleHistoryClick = (q: string) => {
    setSearchQuery(q);
    setSearchFocused(false);
    setNavPage('shop');
    setTimeout(() => {
      loadProductCatalog();
    }, 50);
  };

  const clearHistory = async () => {
    try {
      const { api } = await import('../api');
      await api.searchHistory.clear();
      await loadSearchHistory();
      triggerAlert('Search logs cleared.', 'info');
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavClick = (page: PageId) => {
    setNavPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-55 glass-nav border-b border-white/5 h-20 flex items-center justify-between px-6 md:px-12 transition-all">
      {/* Brand logo */}
      <div 
        onClick={() => handleNavClick('home')} 
        className="flex items-center gap-2 cursor-pointer group"
      >
        <span className="font-display text-2xl font-bold tracking-widest text-white transition-all group-hover:text-gold-400">
          LUXORA
        </span>
        <span className="hidden md:inline font-luxury text-stone-500 text-xs italic tracking-widest mt-1 opacity-70 group-hover:opacity-100 transition-opacity">
          BY VV MART
        </span>
      </div>

      {/* Desktop Main navigation */}
      <div className="hidden lg:flex items-center gap-8 font-display text-xs tracking-widest font-medium uppercase text-stone-300">
        <button 
          onClick={() => handleNavClick('home')} 
          className={`hover:text-gold-400 transition-colors ${navPage === 'home' ? 'text-gold-400 font-bold' : ''}`}
        >
          Home
        </button>
        <button 
          onClick={() => handleNavClick('shop')} 
          className={`hover:text-gold-400 transition-colors ${navPage === 'shop' ? 'text-gold-400 font-bold' : ''}`}
        >
          Shop
        </button>
        <button 
          onClick={() => {
            handleNavClick('shop');
            // Trigger category modal or auto scroll
          }} 
          className="hover:text-gold-400 transition-colors"
        >
          Categories
        </button>
        <button 
          onClick={() => {
            handleNavClick('shop');
            setSearchQuery('');
            triggerAlert('Welcome to limited-time elite curation.', 'info');
          }} 
          className="hover:text-gold-400 transition-colors text-gold-400 animate-pulse"
        >
          Deals
        </button>
      </div>

      {/* Search Bar / Input suggestions */}
      <div ref={searchRef} className="hidden md:block relative w-72 lg:w-96">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            placeholder="Search Curated Luxury..."
            value={searchQuery}
            onFocus={() => setSearchFocused(true)}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900/60 border border-white/10 rounded-full py-2 pl-4 pr-10 text-xs tracking-wider text-white placeholder-stone-500 focus:outline-none focus:border-gold-400/80 transition-all font-display"
          />
          <button type="submit" className="absolute right-3 top-2 text-stone-400 hover:text-gold-400 transition-colors">
            <Search size={14} />
          </button>
        </form>

        <AnimatePresence>
          {searchFocused && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute top-12 left-0 right-0 glass-card rounded-2xl p-4 shadow-2xl border border-white/10 overflow-hidden"
            >
              {/* Autocomplete Suggestions */}
              {suggestions.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-display text-[10px] uppercase tracking-widest text-[#C5A059] mb-2 font-semibold">
                    Suggested Curation
                  </h4>
                  <div className="space-y-2">
                    {suggestions.map(p => (
                      <div
                        key={p.id}
                        onClick={() => handleSuggestionClick(p.id)}
                        className="flex items-center gap-3 p-1.5 hover:bg-stone-800/50 rounded-xl cursor-pointer transition-colors"
                      >
                        <img src={p.images[0]} alt={p.name} className="w-8 h-8 object-cover rounded-md" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-gold-400 font-mono">${p.price.toLocaleString()}</p>
                        </div>
                        <ChevronRight size={12} className="text-stone-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search history logs */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-display text-[10px] uppercase tracking-widest text-stone-500 font-semibold">
                    Recent Relics
                  </h4>
                  {searchHistory.length > 0 && (
                    <button onClick={clearHistory} className="text-[10px] text-[#C5A059] hover:underline font-display tracking-widest uppercase">
                      Clear
                    </button>
                  )}
                </div>
                {searchHistory.length > 0 ? (
                  <div className="space-y-1">
                    {searchHistory.map((hist, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleHistoryClick(hist)}
                        className="flex items-center gap-2 px-2 py-1.5 hover:bg-stone-800/40 rounded-lg cursor-pointer text-xs text-stone-300 transition-colors"
                      >
                        <Clock size={12} className="text-stone-600" />
                        <span className="truncate">{hist}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[10px] text-stone-600 italic py-1 font-display">No query histories recorded.</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Buttons/Widgets */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Wishlist */}
        <button 
          onClick={() => handleNavClick('shop')} 
          className="relative text-stone-400 hover:text-gold-400 transition-all p-1"
        >
          <Heart size={18} className={wishlist.length > 0 ? 'fill-gold-400 text-gold-400' : ''} />
          {wishlist.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold-500 text-[9px] font-mono leading-none py-0.5 px-1.5 rounded-full text-black font-bold border border-[#121214]">
              {wishlist.length}
            </span>
          )}
        </button>

        {/* Shopping bag */}
        <button 
          onClick={() => setCartDrawerOpen(true)} 
          className="relative text-stone-400 hover:text-gold-400 transition-all p-1"
        >
          <ShoppingBag size={18} className={cartCount > 0 ? 'text-gold-400' : ''} />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-gold-400 text-[9px] font-mono leading-none py-0.5 px-1.5 rounded-full text-black font-bold border border-[#121214]">
              {cartCount}
            </span>
          )}
        </button>

        {/* User login dropdown */}
        <div ref={profileRef} className="relative">
          {user ? (
            <div>
              <button 
                onClick={() => setProfileDropdownOpen(p => !p)}
                className="flex items-center gap-2 border border-white/10 hover:border-gold-400/40 rounded-full py-1.5 px-3 transition-colors text-stone-300 hover:text-gold-400 cursor-pointer"
              >
                <div className="w-5 h-5 rounded-full bg-gold-500/10 flex items-center justify-center border border-gold-400/20">
                  <span className="text-[9px] font-bold text-gold-400">
                    {user.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
                <span className="hidden lg:inline text-xs font-display tracking-widest font-semibold uppercase">{user.name.split(' ')[0]}</span>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="absolute right-0 top-12 w-52 glass-card rounded-2xl p-2 shadow-2xl border border-white/10"
                  >
                    <div className="px-3 py-2 border-b border-white/5">
                      <p className="text-[10px] text-stone-500 tracking-wider font-display uppercase font-semibold">Authenticated Profile</p>
                      <p className="text-xs font-medium text-white truncate">{user.name}</p>
                      <p className="text-[10px] text-stone-400 font-mono truncate">{user.email}</p>
                    </div>

                    <div className="py-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleNavClick('orders');
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-stone-300 hover:text-gold-400 hover:bg-stone-800/40 rounded-xl transition-all font-display flex items-center gap-2"
                      >
                        <Clock size={12} />
                        My Orders
                      </button>

                      {user.role === 'admin' && (
                        <button
                          onClick={() => {
                            setProfileDropdownOpen(false);
                            handleNavClick('admin');
                          }}
                          className="w-full text-left px-3 py-2 text-xs text-gold-400 hover:bg-stone-800/50 rounded-xl transition-all font-display flex items-center gap-2"
                        >
                          <Settings size={12} />
                          Admin Console
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-all font-display flex items-center gap-2"
                      >
                        <LogOut size={12} />
                        Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="border border-[#C5A059]/40 rounded-full py-1.5 p-3 px-5 text-xs text-gold-400 tracking-widest font-display font-medium uppercase hover:bg-gold-500 hover:text-black hover:border-gold-500 transition-all font-semibold cursor-pointer"
            >
              Sign In
            </button>
          )}
        </div>

        {/* Mobile menu trigger */}
        <button 
          onClick={() => setMobileMenuOpen(p => !p)} 
          className="lg:hidden text-stone-400 hover:text-white"
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Mobile drawer menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden absolute top-20 left-0 right-0 bg-[#0a0a0b]/95 border-b border-white/5 px-6 py-6 space-y-4 shadow-xl z-50 text-center"
          >
            <div className="flex flex-col gap-4 font-display text-sm tracking-widest uppercase text-stone-200">
              <button onClick={() => handleNavClick('home')} className="hover:text-gold-400 py-1 transition-all">Home</button>
              <button onClick={() => handleNavClick('shop')} className="hover:text-gold-400 py-1 transition-all">Shop</button>
              <button 
                onClick={() => {
                  handleNavClick('shop');
                  setSearchQuery('');
                }} 
                className="hover:text-gold-400 py-1 transition-all"
              >
                Deals
              </button>
            </div>
            {/* Embedded Mobile Search */}
            <form onSubmit={handleSearchSubmit} className="relative max-w-sm mx-auto mt-2">
              <input
                type="text"
                placeholder="Search premium goods..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-stone-900 border border-white/10 rounded-full py-2 pl-4 pr-10 text-xs text-white"
              />
              <button type="submit" className="absolute right-3 top-2.5 text-stone-400">
                <Search size={14} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
