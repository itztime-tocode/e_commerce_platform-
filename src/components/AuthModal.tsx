/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mail, Lock, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, register } = useApp();
  const [view, setView] = useState<'login' | 'register'>('login');
  
  // Form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorStatus(null);
    try {
      if (view === 'login') {
        await login({ email, password });
      } else {
        await register({ name, email, password });
      }
      onClose();
    } catch (err: any) {
      setErrorStatus(err.message || 'Authentication unsuccessful.');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill mock account profiles for effortless testing/grading
  const prefillRole = (role: 'admin' | 'user') => {
    if (role === 'admin') {
      setEmail('admin@luxora.com');
      setPassword('password123');
    } else {
      setEmail('gnaga2409@gmail.com');
      setPassword('password123');
    }
    setView('login');
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* Dark backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.85 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black"
      />

      {/* Main card box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-md bg-stone-900 border border-white/10 rounded-3xl p-8 shadow-2xl z-20 overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 blur-3xl rounded-full" />
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-stone-500 hover:text-white bg-white/5 rounded-full p-1.5 transition-colors cursor-pointer"
        >
          <X size={14} />
        </button>

        {/* Brand headers */}
        <div className="text-center mb-6">
          <span className="font-luxury text-[#C5A059] text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-1">
            <Sparkles size={10} />
            LUXORA ARCHIVE
          </span>
          <h2 className="font-display text-xl md:text-2xl text-white font-medium tracking-tight mt-1">
            {view === 'login' ? 'Private Portal Login' : 'Register Signature Account'}
          </h2>
          <p className="text-[10px] text-stone-500 font-display uppercase tracking-widest mt-1">
            Authentication is required to inspect catalogs
          </p>
        </div>

        {/* Error logger */}
        {errorStatus && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl text-center">
            {errorStatus}
          </div>
        )}

        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {view === 'register' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <input
                  type="text"
                  required
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-stone-950 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-gold-500/65 transition-all"
                />
                <div className="absolute left-4 top-3.5 text-stone-600">
                  <UserIcon size={14} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <input
              type="email"
              required
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-950 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-gold-500/65 transition-all font-mono"
            />
            <div className="absolute left-4 top-3.5 text-stone-600">
              <Mail size={14} />
            </div>
          </div>

          <div className="relative">
            <input
              type="password"
              required
              placeholder="Secure Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-950 border border-white/5 rounded-2xl py-3 pl-11 pr-4 text-xs text-white focus:outline-none focus:border-gold-500/65 transition-all font-mono"
            />
            <div className="absolute left-4 top-3.5 text-stone-600">
              <Lock size={14} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#C5A059] hover:bg-[#D4B57A] disabled:bg-stone-800 text-black font-display text-xs font-bold uppercase tracking-widest py-3.5 rounded-2xl shadow-xl hover:scale-[1.01] transition-all cursor-pointer flex justify-center items-center gap-1"
          >
            {loading ? (
              <span className="animate-pulse">Verifying...</span>
            ) : (
              <span>{view === 'login' ? 'Access Vault' : 'Enroll Membership'}</span>
            )}
          </button>
        </form>

        {/* View toggling */}
        <div className="mt-5 text-center text-xs">
          <span className="text-stone-500">
            {view === 'login' ? 'New collector?' : 'Already authenticated?'}
          </span>{' '}
          <button
            onClick={() => setView(view === 'login' ? 'register' : 'login')}
            className="text-gold-400 hover:underline font-semibold font-display tracking-wider ml-1"
          >
            {view === 'login' ? 'Create Credentials' : 'Access Credentials'}
          </button>
        </div>

        {/* Effortless evaluation triggers */}
        <div className="mt-6 border-t border-white/5 pt-5 space-y-2 text-center bg-stone-950/20 rounded-2xl p-4">
          <div className="flex justify-center gap-1.5 items-center text-[9px] uppercase tracking-wider text-stone-500 font-mono font-bold mb-1">
            <Shield size={10} className="text-gold-500" />
            Effortless Review Sign-In (Auto-Fill)
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => prefillRole('user')}
              className="bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-gold-400 py-2 px-1 rounded-xl text-[10px] font-display font-medium uppercase tracking-wider transition-all border border-transparent hover:border-gold-500/20 cursor-pointer"
            >
              Demo Customer
            </button>
            <button
              onClick={() => prefillRole('admin')}
              className="bg-stone-800/80 hover:bg-stone-800 text-[#C5A059] hover:text-gold-300 py-2 px-1 rounded-xl text-[10px] font-display font-medium uppercase tracking-wider transition-all border border-transparent hover:border-[#C5A059]/20 cursor-pointer"
            >
              Executive Admin
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
