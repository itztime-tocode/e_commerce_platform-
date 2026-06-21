/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const Hero: React.FC = () => {
  const { banners, setNavPage } = useApp();
  const [activeIdx, setActiveIdx] = useState(0);

  // Fallback banners in case API is loading or empty
  const activeBanners = banners && banners.length > 0 ? banners : [
    {
      id: 'default_1',
      title: 'Experience Experience Luxury Shopping Like Never Before',
      subtitle: 'Curated products, premium experiences, and seamless checkout.',
      image: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=1600',
      link: '/shop'
    },
    {
      id: 'default_2',
      title: 'Acoustical Perfection and True Fidelity',
      subtitle: 'Immersive soundscapes from the worlds finest premium audio manufacturers.',
      image: 'https://images.unsplash.com/photo-1554034483-04fda0d3507b?auto=format&fit=crop&q=80&w=1600',
      link: '/shop'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % activeBanners.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [activeBanners.length]);

  const handlePrev = () => {
    setActiveIdx(prev => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleNext = () => {
    setActiveIdx(prev => (prev + 1) % activeBanners.length);
  };

  const currentBanner = activeBanners[activeIdx];

  return (
    <div className="relative h-[90vh] md:h-screen w-full bg-black overflow-hidden flex items-center justify-center">
      {/* Background Images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentBanner.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 0.55, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentBanner.image})` }}
        />
      </AnimatePresence>

      {/* Elegant Dark Gradients Mask */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />

      {/* Content Canvas */}
      <div className="relative z-10 max-w-5xl mx-auto text-center px-6 md:px-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="space-y-6"
          >
            {/* Elegant sub-header */}
            <motion.p 
              initial={{ opacity: 0, letterSpacing: '0.1em' }}
              animate={{ opacity: 1, letterSpacing: '0.3em' }}
              transition={{ delay: 0.2, duration: 1.2 }}
              className="font-display text-[10px] sm:text-xs uppercase tracking-widest text-[#C5A059] font-bold"
            >
              Exquisite Luxury Showcase
            </motion.p>

            {/* Giant display headline */}
            <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-light text-white leading-tight font-extralight tracking-tight max-w-4xl mx-auto">
              {currentBanner.title}
            </h1>

            {/* Subtitle */}
            <p className="font-luxury text-stone-300 text-lg md:text-2xl font-light max-w-2xl mx-auto italic opacity-90">
              {currentBanner.subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
              <button
                onClick={() => {
                  setNavPage('shop');
                  window.scrollTo({ top: 750, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto bg-[#C5A059] text-black font-display text-xs font-semibold tracking-widest uppercase hover:bg-[#D4B57A] hover:scale-105 rounded-full py-4 px-10 shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                Shop Now
                <ArrowRight size={14} />
              </button>
              <button
                onClick={() => {
                  setNavPage('shop');
                  window.scrollTo({ top: 1200, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto border border-white/20 hover:border-gold-400 font-display text-xs font-semibold tracking-widest uppercase text-white hover:bg-white/5 rounded-full py-4 px-8 transition-all cursor-pointer"
              >
                Explore Collection
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Manual Slide Controls */}
      <button 
        onClick={handlePrev}
        className="absolute left-6 z-20 text-stone-400 hover:text-white border border-white/10 hover:border-gold-400/40 bg-black/30 p-2.5 rounded-full transition-all cursor-pointer"
      >
        <ChevronLeft size={18} />
      </button>
      <button 
        onClick={handleNext}
        className="absolute right-6 z-20 text-stone-400 hover:text-white border border-white/10 hover:border-gold-400/40 bg-black/30 p-2.5 rounded-full transition-all cursor-pointer"
      >
        <ChevronRight size={18} />
      </button>

      {/* Bottom sliding ticks */}
      <div className="absolute bottom-10 flex gap-2 z-20">
        {activeBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIdx(idx)}
            className={`h-1.5 rounded-full transition-all cursor-pointer ${idx === activeIdx ? 'w-8 bg-[#C5A059]' : 'w-2 bg-stone-700 hover:bg-stone-500'}`}
          />
        ))}
      </div>
    </div>
  );
};
