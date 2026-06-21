/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import { Mail, Phone, MapPin, Shield, RotateCcw, Award, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setNavPage, triggerAlert } = useApp();

  const handleLinkClick = (page: 'home' | 'shop') => {
    setNavPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const subscribeNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    triggerAlert('Bespoke subscription validated. You are now placed on the elite mailing list.', 'success');
    const input = (e.target as HTMLFormElement).elements.namedItem('email') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <footer className="bg-charcoal border-t border-white/5 pt-16 pb-12 text-stone-300 font-display">
      <div className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
        
        {/* Brand Information */}
        <div className="space-y-4">
          <h3 className="text-xl font-bold tracking-widest text-white">LUXORA</h3>
          <p className="text-s text-gold-400 font-luxury italic leading-relaxed">
            "Luxury Delivered Perfectly"
          </p>
          <p className="text-xs text-stone-500 leading-relaxed max-w-sm">
            LUXORA curation represents the pinnacle of modern design, meticulous engineering, and elite performance. Crafting experiences that define a generation.
          </p>
          <div className="flex gap-4 pt-2">
            {['Instagram', 'Twitter', 'Facebook', 'LinkedIn'].map(social => (
              <span 
                key={social}
                onClick={() => triggerAlert(`Connecting to LUXORA verified ${social} channel...`, 'info')}
                className="text-xs text-stone-500 hover:text-gold-400 cursor-pointer transition-colors"
              >
                {social}
              </span>
            ))}
          </div>
        </div>

        {/* Directory Links */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold font-display">Exquisite Curation</h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li>
              <button onClick={() => handleLinkClick('home')} className="hover:text-gold-400 transition-colors">
                Main Portal
              </button>
            </li>
            <li>
              <button onClick={() => handleLinkClick('shop')} className="hover:text-gold-400 transition-colors">
                E-Gallery List
              </button>
            </li>
            <li>
              <button onClick={() => triggerAlert('Our complete heritage files are currently being digitalized.', 'info')} className="hover:text-gold-400 transition-colors">
                Bespoke Heritage
              </button>
            </li>
            <li>
              <button onClick={() => triggerAlert('Complimentary concierge lines are open 24/7 at +1 (800) LUX-PORT.', 'info')} className="hover:text-gold-400 transition-colors">
                Curator Concierge
              </button>
            </li>
          </ul>
        </div>

        {/* Legal & Security */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-gold-400 font-semibold">Security & Policy</h4>
          <ul className="space-y-2.5 text-xs text-stone-400">
            <li>
              <button onClick={() => triggerAlert('Full Privacy Policy details will be compiled inside our Terms manual.', 'info')} className="hover:text-gold-400 transition-colors">
                Privacy Protection
              </button>
            </li>
            <li>
              <button onClick={() => triggerAlert('Client terms are fully standard. All delivery assets are secure.', 'info')} className="hover:text-gold-400 transition-colors">
                Terms of Protocol
              </button>
            </li>
            <li>
              <button onClick={() => triggerAlert('Authenticity Certificate included with every luxury dispatch.', 'success')} className="hover:text-gold-400 transition-colors">
                Digital Certificate
              </button>
            </li>
            <li>
              <button onClick={() => triggerAlert('Client assets are insured up to $1,000,000 per delivery event.', 'success')} className="hover:text-gold-400 transition-colors">
                Vault Delivery Insurance
              </button>
            </li>
          </ul>
        </div>

        {/* Newsletter subscription */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-widest text-[#C5A059] font-semibold font-display">Elite Newsletter</h4>
          <p className="text-xs text-stone-500 leading-relaxed">
            Subscribe to receive private previews of forthcoming collections, elite auctions, and brand catalogs.
          </p>
          <form onSubmit={subscribeNewsletter} className="space-y-2">
            <input
              type="email"
              name="email"
              required
              placeholder="Email Profile Address"
              className="w-full bg-stone-900 border border-white/5 rounded-full py-2.5 px-4 text-xs tracking-wider text-white placeholder-stone-600 focus:outline-none focus:border-gold-500/80 transition-all"
            />
            <button
              type="submit"
              className="w-full bg-[#0a0a0a] text-gold-400 border border-[#C5A059]/20 hover:border-[#C5A059] hover:bg-[#C5A059] hover:text-black font-display text-[10px] uppercase font-bold tracking-widest rounded-full py-2.5 transition-all text-center cursor-pointer"
            >
              Sign Up
            </button>
          </form>
        </div>
      </div>

      {/* Trust Signatures */}
      <div className="border-t border-b border-white/5 py-8 mb-8 max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
        <div className="flex items-center gap-3 justify-center sm:justify-start">
          <Award size={18} className="text-gold-400 shrink-0" />
          <div>
            <h5 className="text-xs text-white font-semibold">100% Certified Authentic</h5>
            <p className="text-[10px] text-stone-500">Every item curated is sourced directly with signatures.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 justify-center">
          <RotateCcw size={18} className="text-gold-400 shrink-0" />
          <div>
            <h5 className="text-xs text-white font-semibold">Complimentary Return Care</h5>
            <p className="text-[10px] text-stone-500">Enjoy 30-day effortless premium vault pick-up returns.</p>
          </div>
        </div>
        <div className="flex items-center gap-3 justify-center sm:justify-end">
          <Shield size={18} className="text-gold-400 shrink-0" />
          <div>
            <h5 className="text-xs text-white font-semibold">Insured Global Transit</h5>
            <p className="text-[10px] text-stone-500 flex sm:justify-end">Zero-risk express dispatch locked inside airtight containers.</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center text-[10px] text-stone-600 tracking-wider uppercase">
        <p>© 2026 LUXORA PLATFORM. POWERED BY VV MART. ALL ELITE STATUS RIGHTS RESERVED.</p>
        <p className="flex items-center gap-1 mt-2 md:mt-0 font-luxury italic text-stone-500">
          <Sparkles size={10} className="text-[#C5A059]" />
          Luxury Delivered Perfectly
        </p>
      </div>
    </footer>
  );
};
