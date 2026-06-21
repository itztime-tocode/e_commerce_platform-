/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Address, Order } from '../types';
import { api } from '../api';
import { 
  Plus, Edit, Trash2, ChevronRight, CheckCircle, CreditCard, Gift, 
  MapPin, ShieldCheck, Heart, RefreshCw, Sparkles, Receipt, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CheckoutFlow: React.FC = () => {
  const {
    cart,
    addresses,
    addAddress,
    removeAddress,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    saveOrder,
    triggerAlert
  } = useApp();

  // Step tracker (1: Address, 2: Review, 3: Coupon, 4: Payment, 5: Complete)
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Address create form
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [isDefault, setIsDefault] = useState(false);

  // Coupon promo input
  const [couponInputCode, setCouponInputCode] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Payment states
  const [paymentOption, setPaymentOption] = useState<'cc' | 'debit' | 'upi' | 'netbank' | 'wallet'>('cc');
  const [cardNo, setCardNo] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentLocking, setPaymentLocking] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Order Invoice completed holder
  const [placedInvoice, setPlacedInvoice] = useState<Order | null>(null);

  // Math totals calculation
  const subtotal = cart.reduce((tot, item) => tot + item.product.price * item.quantity, 0);
  const discountVal = appliedCoupon 
    ? (appliedCoupon.type === 'percentage' ? (subtotal * appliedCoupon.value) / 100 : appliedCoupon.value)
    : 0;
  const taxVal = (subtotal - discountVal) * 0.0825; // 8.25% luxury state surcharge
  const shippingVal = subtotal > 5000 ? 0 : 1500; // complimentary above $5K limit
  const finalTotalVal = subtotal - discountVal + taxVal + shippingVal;

  useEffect(() => {
    // Select default address if present on mount
    if (addresses.length > 0 && !selectedAddress) {
      const defAddr = addresses.find(a => a.isDefault) || addresses[0];
      setSelectedAddress(defAddr);
    }
  }, [addresses]);

  const handleAddNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addAddress({
        fullName,
        phone,
        streetAddress,
        city,
        state,
        postalCode,
        country,
        isDefault
      });
      setAddressFormOpen(false);
      // clean inputs
      setFullName('');
      setPhone('');
      setStreetAddress('');
      setCity('');
      setState('');
      setPostalCode('');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleApplyCouponCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInputCode.trim()) return;
    setApplyingCoupon(true);
    try {
      await applyCoupon(couponInputCode);
      setCouponInputCode('');
    } finally {
      setApplyingCoupon(false);
    }
  };

  const handlePaymentAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress) {
      triggerAlert('Please complete shipping destination information first.', 'error');
      setActiveStep(1);
      return;
    }

    setPaymentLocking(true);
    
    // Simulate high-contrast credit processing timers
    setTimeout(async () => {
      try {
        const orderRes = await saveOrder({
          shippingAddress: selectedAddress,
          paymentMethod: paymentOption === 'cc' ? 'Elite Platinum Credit' : paymentOption === 'upi' ? 'UPI Secure Net' : 'Premium Wallet Direct'
        });
        setPlacedInvoice(orderRes);
        setPaymentSuccess(true);
        setActiveStep(5);
      } catch (err) {
        console.error(err);
      } finally {
        setPaymentLocking(false);
      }
    }, 4500);
  };

  const downloadSimulatedPdfInvoice = () => {
    if (!placedInvoice) return;
    triggerAlert(`Bespoke digital PDF Invoice reference ${placedInvoice.id} generated and downloaded to device folders catalog.`, 'success');
  };

  // Checkout Headers Progress Links row
  const checkoutStepsHeader = [
    { num: 1, label: 'Delivery Destination' },
    { num: 2, label: 'Summary Audit' },
    { num: 3, label: 'Apply Voucher' },
    { num: 4, label: 'Secure Settlement' },
    { num: 5, label: 'Handover Complete' }
  ];

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-16 px-6 md:px-12 font-display">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Title bar */}
        <div className="text-center md:text-left">
          <span className="text-[10px] uppercase tracking-widest text-[#C5A059] font-bold font-mono block">VIP SECURE PORTAL</span>
          <h1 className="text-2xl md:text-3xl text-white font-medium mt-1">Authentic Checkout</h1>
        </div>

        {/* Progress Timeline Header */}
        <div className="border-b border-white/5 pb-6">
          <div className="flex flex-wrap items-center justify-between gap-4 font-display text-[9px] uppercase tracking-widest font-bold">
            {checkoutStepsHeader.map((hdr) => (
              <div 
                key={hdr.num}
                className={`flex items-center gap-2.5 transition-colors ${
                  activeStep === hdr.num 
                    ? 'text-gold-400' 
                    : activeStep > hdr.num 
                      ? 'text-stone-300' 
                      : 'text-stone-600'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono border text-[10px] ${
                  activeStep === hdr.num 
                    ? 'border-gold-400 bg-stone-900 shadow-md gold-border-glow' 
                    : activeStep > hdr.num 
                      ? 'border-gold-500 bg-gold-500 text-black' 
                      : 'border-stone-800 bg-transparent'
                }`}>
                  {hdr.num}
                </div>
                <span className="hidden sm:inline">{hdr.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Core Layout split: main step canvas + summary details billing panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-6">
            <AnimatePresence mode="wait">
              
              {/* STEP 1: SHIPPING ADDRESS BOOK */}
              {activeStep === 1 && (
                <motion.div
                  key="step_1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center bg-stone-900/45 p-6 rounded-2xl border border-white/5">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Select Delivery Destination</h3>
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">Please indicate where we should schedule dispatch</p>
                    </div>
                    <button
                      onClick={() => setAddressFormOpen(prev => !prev)}
                      className="border border-[#C5A059]/40 hover:border-[#C5A059] text-[#C5A059] hover:text-white px-4 py-2 font-display text-[10px] uppercase font-bold tracking-widest rounded-full transition-colors cursor-pointer"
                    >
                      <Plus size={12} className="inline mr-1" /> Add Address
                    </button>
                  </div>

                  {/* Add address Form inline */}
                  <AnimatePresence>
                    {addressFormOpen && (
                      <motion.form
                        onSubmit={handleAddNewAddress}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-stone-900 border border-white/10 rounded-2xl p-6 space-y-4 overflow-hidden"
                      >
                        <h4 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold border-b border-white/5 pb-2">Add New shipping detail</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            required
                            placeholder="Recipient Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Primary Contact phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white font-mono"
                          />
                        </div>
                        <input
                          type="text"
                          required
                          placeholder="Street Address, Penthouse Block"
                          value={streetAddress}
                          onChange={(e) => setStreetAddress(e.target.value)}
                          className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                        />
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <input
                            type="text"
                            required
                            placeholder="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                          />
                          <input
                            type="text"
                            placeholder="State"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Postal Code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                            className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white font-mono"
                          />
                          <input
                            type="text"
                            required
                            placeholder="Country"
                            value={country}
                            onChange={(e) => setCountry(e.target.value)}
                            className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white font-medium"
                          />
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => setAddressFormOpen(false)}
                            className="border border-white/5 text-stone-300 py-2 px-4 rounded-xl text-xs hover:bg-stone-850"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-gold-500 text-black py-2 px-5 rounded-xl text-xs font-bold"
                          >
                            Save Shipping Card
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Address List row selection */}
                  <div className="space-y-3">
                    {addresses.length > 0 ? (
                      addresses.map(addr => (
                        <div
                          key={addr.id}
                          onClick={() => setSelectedAddress(addr)}
                          className={`p-5 rounded-2xl border cursor-pointer transition-all flex items-start gap-4 ${
                            selectedAddress?.id === addr.id
                              ? 'bg-stone-900/60 border-gold-400 text-white shadow-lg shadow-gold-500/5'
                              : 'bg-stone-950/40 border-white/5 hover:border-white/20 text-stone-300'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border mt-1.5 shrink-0 flex items-center justify-center ${
                            selectedAddress?.id === addr.id ? 'border-gold-400 text-gold-400' : 'border-stone-700'
                          }`}>
                            {selectedAddress?.id === addr.id && <div className="w-1.5 h-1.5 rounded-full bg-gold-400" />}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-xs tracking-wider uppercase text-white truncate">{addr.fullName}</h4>
                              {addr.isDefault && (
                                <span className="bg-stone-900 border border-white/10 text-[9px] uppercase tracking-widest text-[#C5A059] py-0.5 px-2 rounded-full font-bold leading-none">
                                  Default Vault
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-400 mt-1 leading-relaxed font-light">
                              {addr.streetAddress}, {addr.city}, {addr.state} - {addr.postalCode}, {addr.country}
                            </p>
                            <p className="text-[10px] text-stone-500 font-mono mt-0.5">{addr.phone}</p>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Delete this dispatch destination?')) removeAddress(addr.id);
                            }}
                            className="text-stone-500 hover:text-rose-400 p-1.5 transition-colors cursor-pointer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-stone-500 italic py-6 text-center font-display">No registered delivery targets found. Please add a shipping destination.</p>
                    )}
                  </div>

                  {selectedAddress && (
                    <div className="flex justify-end pt-4">
                      <button
                        onClick={() => setActiveStep(2)}
                        className="bg-gold-500 hover:bg-gold-400 text-black font-display text-xs font-bold uppercase tracking-widest rounded-full py-3 px-8 shadow-xl hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        Proceed to Order Review <ChevronRight size={14} />
                      </button>
                    </div>
                  )}
                </motion.div>
              )}

              {/* STEP 2: ORDER REVIEW */}
              {activeStep === 2 && (
                <motion.div
                  key="step_2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="bg-stone-900/40 p-5 rounded-2xl border border-white/5 space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Review Items & Billing Details</h3>
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">Please audit items, quantities, and pricing summaries prior to checkout</p>
                    </div>

                    <div className="divide-y divide-white/5 space-y-3">
                      {cart.map(item => (
                        <div key={item.product.id} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-center">
                          <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded-lg bg-stone-950" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-xs text-white truncate">{item.product.name}</h4>
                            <p className="text-[10px] text-stone-400 font-mono mt-0.5">Quantity: {item.quantity} × ${item.product.price.toLocaleString()}</p>
                          </div>
                          <span className="font-mono text-sm font-bold text-white text-right">
                            ${(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => setActiveStep(1)}
                      className="border border-white/10 hover:border-white/30 text-stone-400 hover:text-white rounded-full py-3 px-7 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setActiveStep(3)}
                      className="bg-gold-500 hover:bg-gold-400 text-black font-display text-xs font-bold uppercase tracking-widest rounded-full py-3 px-8 shadow-xl hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      Audit OK, Proceed to Rewards <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: COUPON REWARDS */}
              {activeStep === 3 && (
                <motion.div
                  key="step_3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="bg-stone-900/40 p-6 rounded-2xl border border-white/5 space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Apply VIP Promo Rewards</h3>
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">Validate custom code vouchers for complimentary discounts</p>
                    </div>

                    <form onSubmit={handleApplyCouponCode} className="flex gap-3">
                      <input
                        type="text"
                        placeholder="VIP PROMO CODE (e.g. LUXURY20)"
                        value={couponInputCode}
                        onChange={(e) => setCouponInputCode(e.target.value)}
                        className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white flex-1 font-mono tracking-wider placeholder-stone-600 focus:outline-none focus:border-gold-400/50"
                      />
                      <button
                        type="submit"
                        disabled={applyingCoupon}
                        className="bg-gold-400 hover:bg-gold-500 text-black px-6 text-xs uppercase font-extrabold tracking-widest rounded-xl shadow-md transition-all flex items-center gap-1 cursor-pointer disabled:bg-stone-800"
                      >
                        {applyingCoupon ? <RefreshCw className="animate-spin" size={12} /> : 'Claim'}
                      </button>
                    </form>

                    {appliedCoupon ? (
                      <div className="p-4 bg-gold-500/10 border border-[#C5A059]/20 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5 text-gold-400">
                          <Gift size={16} />
                          <div>
                            <p className="text-xs font-bold">Reward Activates: {appliedCoupon.code}</p>
                            <p className="text-[9px] uppercase tracking-wider text-stone-400 font-mono mt-0.5">
                              {appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% reduction applied` : `$${appliedCoupon.value.toLocaleString()} fixed discount applied`}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeCoupon}
                          className="bg-white/5 hover:bg-white/10 text-stone-300 py-1.5 px-3 rounded-lg text-[9px] uppercase tracking-widest font-bold font-mono transition-colors cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="p-4 bg-stone-950/20 border border-white/5 rounded-xl text-center text-xs text-stone-500 space-y-1">
                        <p>No reward vouchers evaluated yet.</p>
                        <p className="text-[9px] uppercase tracking-wider text-[#C5A059] hover:underline cursor-pointer" onClick={() => setCouponInputCode('LUXURY20')}>
                          Quick Apply Demo Code: LUXURY20 (20% Off)
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => setActiveStep(2)}
                      className="border border-white/10 hover:border-white/30 text-stone-400 hover:text-white rounded-full py-3 px-7 text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setActiveStep(4)}
                      className="bg-gold-500 hover:bg-gold-400 text-black font-display text-xs font-bold uppercase tracking-widest rounded-full py-3 px-8 shadow-xl hover:scale-105 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      Proceed to Secure Payment <ChevronRight size={14} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: PAYMENT INTERACTION GATEWAY */}
              {activeStep === 4 && (
                <motion.div
                  key="step_4"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="bg-stone-900/40 p-6 rounded-2xl border border-white/5 space-y-5">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-wider text-white">Secure Settlement Gateway</h3>
                      <p className="text-[10px] text-stone-500 uppercase tracking-widest mt-0.5">Encrypted settlement system. Please complete payment specifications.</p>
                    </div>

                    {/* Method Selector */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-stone-950/40 p-1 rounded-xl">
                      {([
                        { id: 'cc', label: 'Credit Card' },
                        { id: 'debit', label: 'Debit Card' },
                        { id: 'upi', label: 'UPI Secure' },
                        { id: 'netbank', label: 'Net Banking' }
                      ] as const).map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setPaymentOption(opt.id)}
                          className={`py-2 px-3 text-[10px] uppercase font-bold tracking-widest rounded-lg transition-colors cursor-pointer ${
                            paymentOption === opt.id
                              ? 'bg-gold-500 text-black shadow font-bold'
                              : 'text-stone-400 hover:text-white'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Billing input sheets wrapper */}
                    <form onSubmit={handlePaymentAuthorize} className="space-y-4 pt-3">
                      
                      {paymentOption === 'cc' || paymentOption === 'debit' ? (
                        <div className="space-y-4">
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="Noble Cardholder Full Name"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 pl-11 pr-4 text-xs text-white placeholder-stone-600 focus:outline-none focus:border-gold-400/50"
                            />
                            <div className="absolute left-4 top-3.5 text-stone-600">
                              <CreditCard size={14} />
                            </div>
                          </div>

                          <input
                            type="text"
                            required
                            placeholder="Card Number (4000 1234 5678 9010)"
                            value={cardNo}
                            onChange={(e) => setCardNo(e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim().substring(0, 19))}
                            className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white font-mono tracking-wider focus:outline-none"
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <input
                              type="text"
                              required
                              placeholder="Expiry Date (MM/YY)"
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value.substring(0, 5))}
                              className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white font-mono focus:outline-none"
                            />
                            <input
                              type="password"
                              required
                              placeholder="CVV (3 Digits)"
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, '').substring(0, 3))}
                              className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white font-mono focus:outline-none"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 p-4 bg-stone-950/20 border border-white/5 rounded-xl text-center space-y-3">
                          <p className="text-xs text-stone-400">Please provide your localized secure address identifier parameters</p>
                          <input
                            type="text"
                            required
                            placeholder="vvmart@upi or secure@netbank"
                            className="bg-stone-950 border border-white/10 rounded-xl py-3 px-4 text-xs text-white font-mono text-center w-full max-w-sm focus:outline-none focus:border-gold-400/50"
                          />
                        </div>
                      )}

                      <div className="border-t border-white/5 pt-5 space-y-4">
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                          <ShieldCheck size={14} className="text-gold-500" />
                          <span>Fully Encrypted 3D-Secure transaction certified. LUXORA never records raw CVV data.</span>
                        </div>

                        <div className="flex justify-between items-center bg-stone-950 p-4 rounded-xl border border-[#C5A059]/10">
                          <span className="text-xs text-stone-400 uppercase tracking-widest">Aggregate settlement liability</span>
                          <span className="font-mono text-lg font-bold text-gold-400">${finalTotalVal.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setActiveStep(3)}
                          disabled={paymentLocking}
                          className="border border-white/10 hover:border-white/30 text-stone-400 hover:text-white rounded-full py-3 px-7 text-xs font-semibold uppercase tracking-wider transition-colors disabled:opacity-50 hover:bg-stone-900 cursor-pointer"
                        >
                          Back
                        </button>
                        <button
                          type="submit"
                          disabled={paymentLocking}
                          className="bg-gold-500 hover:bg-gold-400 disabled:bg-stone-800 text-black font-display text-xs font-bold uppercase tracking-widest rounded-full py-3.5 px-8 shadow-xl hover:scale-105 transition-all flex items-center justify-center gap-2 cursor-pointer relative min-w-[220px]"
                        >
                          {paymentLocking ? (
                            <span className="flex items-center gap-2">
                              <RefreshCw className="animate-spin" size={14} /> Authorizing Vault Settle...
                            </span>
                          ) : (
                            <span>Confirm & Transact</span>
                          )}
                        </button>
                      </div>

                    </form>
                  </div>
                </motion.div>
              )}

              {/* STEP 5: HANDOVER / SUCCESS CONFIRMATION INVOICE */}
              {activeStep === 5 && placedInvoice && (
                <motion.div
                  key="step_5"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-6"
                >
                  <div className="inline-flex w-16 h-16 bg-gold-400/15 rounded-full items-center justify-center border border-[#C5A059]/30 gold-border-glow text-[#C5A059] animate-bounce">
                    <Sparkles size={28} />
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-display text-2xl md:text-3xl text-white font-medium tracking-tight">Luxury Authenticated Perfectly</h2>
                    <p className="text-xs text-gold-400 uppercase tracking-widest font-mono">Bespoke Reference signature Code: {placedInvoice.id}</p>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                      Your high-end luxury assets have been safely scheduled for complimentary vault transit.
                    </p>
                  </div>

                  {/* Receipt overview details */}
                  <div className="glass-card p-6 rounded-2xl max-w-md mx-auto text-left space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold-400/5 blur-2xl rounded-full" />
                    
                    <h3 className="text-xs uppercase tracking-widest text-[#C5A059] border-b border-white/5 pb-2 font-bold flex items-center gap-1.5 leading-none">
                      <Receipt size={14} /> VIP billing invoice summary
                    </h3>
                    
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-stone-400">Invoiced Recipient:</span>
                        <span className="text-white font-semibold">{placedInvoice.shippingAddress.fullName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Scheduled Dispatch Target:</span>
                        <span className="text-white font-medium text-right font-light truncate max-w-[200px]">{placedInvoice.shippingAddress.streetAddress}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2 mt-2">
                        <span className="text-stone-400">Complimentary Courier:</span>
                        <span className="text-stone-300">LUXORA Vault Dispatch</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-stone-400">Arrival Estimation:</span>
                        <span className="text-gold-400 font-mono font-semibold">{new Date(placedInvoice.estimatedDelivery).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-white/5 pt-2 text-sm font-bold">
                        <span className="text-white">Aggregate Amount Settle:</span>
                        <span className="text-gold-400 font-mono">${placedInvoice.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
                    <button
                      onClick={downloadSimulatedPdfInvoice}
                      className="w-full bg-stone-900 border border-white/5 hover:border-[#C5A059] text-gold-400 hover:text-white py-3.5 px-6 rounded-full font-display text-[10px] uppercase font-bold tracking-widest transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <FileText size={12} /> Download PDF Invoice
                    </button>
                    <button
                      onClick={() => {
                        window.location.reload(); // Refresh catalog state
                      }}
                      className="w-full bg-gold-500 hover:bg-gold-400 text-black py-3.5 px-6 rounded-full font-display text-[10px] uppercase font-bold tracking-widest transition-all shadow-lg hover:scale-102 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Return to Gallery Listings
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* RIGHT SIDEBAR: BILLING SUMMARY TICKET (Only shows before step 5 complete) */}
          {activeStep < 5 && (
            <div className="glass-card p-6 rounded-3xl space-y-6 relative overflow-hidden h-fit">
              <div className="absolute top-0 right-0 w-24 h-16 bg-gold-400/5 blur-2xl rounded-full" />
              
              <h3 className="text-xs uppercase tracking-widest text-[#C5A059] border-b border-white/5 pb-2 font-bold flex items-center gap-1.5 leading-none">
                <Receipt size={14} /> Settlement ticket
              </h3>

              <div className="space-y-3.5 text-xs text-stone-300">
                <div className="flex justify-between">
                  <span>Cart valuation:</span>
                  <span className="font-mono text-white">${subtotal.toLocaleString()}</span>
                </div>
                
                {discountVal > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span className="flex items-center gap-1">Voucher Rewards:</span>
                    <span className="font-mono">-${discountVal.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Luxury state surcharge (8.25%):</span>
                  <span className="font-mono text-stone-400">${taxVal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between pb-3 border-b border-white/5">
                  <span>Insured Vault Dispatch:</span>
                  <span className="font-mono text-stone-400">
                    {shippingVal === 0 ? (
                      <span className="text-gold-400 uppercase tracking-wider font-bold">Complimentary</span>
                    ) : (
                      `$${shippingVal.toLocaleString()}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between pt-1 font-bold text-sm">
                  <span className="text-white">Aggregate settlement:</span>
                  <span className="text-gold-400 font-mono">${finalTotalVal.toLocaleString()}</span>
                </div>
              </div>

              {selectedAddress && (
                <div className="p-3 bg-stone-950/40 rounded-xl space-y-1 border border-white/5 text-[10px] leading-relaxed">
                  <span className="uppercase text-stone-500 font-bold block tracking-wider">Scheduled Target destination</span>
                  <p className="text-stone-300 font-medium truncate">{selectedAddress.fullName}</p>
                  <p className="text-stone-500 truncate">{selectedAddress.streetAddress}, {selectedAddress.city}</p>
                </div>
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
