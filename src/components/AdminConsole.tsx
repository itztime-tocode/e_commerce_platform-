/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api';
import { AnalyticsSummary, Product, Category, Order, Coupon, Banner, TrackingStatus } from '../types';
import { 
  TrendingUp, ShoppingBag, Users, Layers, Tag, Image, Plus, Edit, Trash2, 
  RefreshCw, CheckCircle, AlertTriangle, ArrowRight, DollarSign, Archive, X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminConsole: React.FC = () => {
  const { categories, setNavPage, triggerAlert } = useApp();
  const [activeTab, setActiveTab] = useState<'metrics' | 'products' | 'categories' | 'orders' | 'coupons' | 'banners'>('metrics');
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic Lists for Administration
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [ordersList, setOrdersList] = useState<Order[]>([]);
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [bannersList, setBannersList] = useState<Banner[]>([]);

  // Editing Modal / States
  const [editProduct, setEditProduct] = useState<Partial<Product> | null>(null);
  const [editCategory, setEditCategory] = useState<Partial<Category> | null>(null);
  const [editCoupon, setEditCoupon] = useState<Partial<Coupon> | null>(null);
  const [editBanner, setEditBanner] = useState<Partial<Banner> | null>(null);

  // Spec entry holder
  const [specName, setSpecName] = useState('');
  const [specValue, setSpecValue] = useState('');

  // Feature text holder
  const [featureText, setFeatureText] = useState('');

  // Loaded analytics
  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const data = await api.analytics.get();
      setAnalytics(data);

      const [prods, cats, ords, coups, bans] = await Promise.all([
        api.products.list(),
        api.categories.list(),
        api.orders.list(),
        api.coupons.list(),
        api.banners.adminList()
      ]);

      setProductsList(prods);
      setCategoriesList(cats);
      setOrdersList(ords);
      setCouponsList(coups);
      setBannersList(bans);
    } catch (err: any) {
      triggerAlert(err.message || 'Failed load admin statistics.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  // Product CRUD
  const saveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editProduct) return;
    try {
      if (editProduct.id) {
        // Edit
        const res = await api.products.update(editProduct.id, editProduct);
        triggerAlert('Product metrics updated.', 'success');
      } else {
        // Create novel
        const res = await api.products.create(editProduct);
        triggerAlert('Unique masterpiece added to catalog.', 'success');
      }
      setEditProduct(null);
      fetchAnalytics();
    } catch (err: any) {
      triggerAlert(err.message || 'Product upload blocked.', 'error');
    }
  };

  const deleteProductItem = async (id: string) => {
    if (!confirm('Are you absolutely certain you want to purge this exclusive asset?')) return;
    try {
      await api.products.delete(id);
      triggerAlert('Item purged successfully.', 'success');
      fetchAnalytics();
    } catch (err: any) {
      triggerAlert(err.message || 'Purging blocked.', 'error');
    }
  };

  // Category CRUD
  const saveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCategory) return;
    try {
      if (editCategory.id) {
        await api.categories.update(editCategory.id, editCategory);
        triggerAlert('Category catalog descriptors updated.', 'success');
      } else {
        await api.categories.create(editCategory);
        triggerAlert('New catalog division scheduled.', 'success');
      }
      setEditCategory(null);
      fetchAnalytics();
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  const deleteCategoryItem = async (id: string) => {
    if (!confirm('Purge this collection path?')) return;
    try {
      await api.categories.delete(id);
      triggerAlert('Division removed.', 'success');
      fetchAnalytics();
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  // Coupons CRUD
  const saveCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCoupon) return;
    try {
      if (editCoupon.id) {
        await api.coupons.update(editCoupon.id, editCoupon);
        triggerAlert('Coupon rules modified.', 'success');
      } else {
        await api.coupons.create(editCoupon);
        triggerAlert('Campaign coupon instantiated.', 'success');
      }
      setEditCoupon(null);
      fetchAnalytics();
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  const deleteCouponItem = async (id: string) => {
    if (!confirm('Deactivate and delete this code?')) return;
    try {
      await api.coupons.delete(id);
      triggerAlert('Coupon removed.', 'success');
      fetchAnalytics();
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  // Banners CRUD
  const saveBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBanner) return;
    try {
      if (editBanner.id) {
        await api.banners.update(editBanner.id, editBanner);
        triggerAlert('Banner assets synced.', 'success');
      } else {
        await api.banners.create(editBanner);
        triggerAlert('Hero banner campaign deployed.', 'success');
      }
      setEditBanner(null);
      fetchAnalytics();
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  const deleteBannerItem = async (id: string) => {
    if (!confirm('Dismount this showcase banner?')) return;
    try {
      await api.banners.delete(id);
      triggerAlert('Banner dismounted.', 'success');
      fetchAnalytics();
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  // Status controls
  const handleOrderStatusChange = async (orderId: string, status: string) => {
    try {
      await api.orders.updateStatus(orderId, status);
      triggerAlert(`Order tracker modified to: ${status.toUpperCase()}`, 'success');
      fetchAnalytics();
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  const replenishStock = async (product: Product, plusQty: number) => {
    try {
      const targetQty = product.inventory + plusQty;
      await api.products.update(product.id, { inventory: targetQty });
      triggerAlert(`Added ${plusQty} pieces to ${product.name} vault.`, 'success');
      fetchAnalytics();
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  // Auto-Uploader Trigger
  const handleSimulatedImageUpload = async (field: 'images' | 'image') => {
    try {
      const res = await api.upload('base64StringMock');
      if (field === 'images' && editProduct) {
        const currentArr = editProduct.images || [];
        setEditProduct({ ...editProduct, images: [...currentArr, res.secure_url] });
      } else if (field === 'image' && editCategory) {
        setEditCategory({ ...editCategory, image: res.secure_url });
      } else if (field === 'image' && editBanner) {
        setEditBanner({ ...editBanner, image: res.secure_url });
      }
      triggerAlert('Mock photographic upload resolved via Cloudinary.', 'success');
    } catch (err: any) {
      triggerAlert(err.message, 'error');
    }
  };

  // Add Spec to product
  const addProductSpec = () => {
    if (!specName || !specValue || !editProduct) return;
    const currentSpecs = editProduct.specs || [];
    setEditProduct({
      ...editProduct,
      specs: [...currentSpecs, { name: specName, value: specValue }]
    });
    setSpecName('');
    setSpecValue('');
  };

  const removeProductSpec = (nameToDelete: string) => {
    if (!editProduct || !editProduct.specs) return;
    setEditProduct({
      ...editProduct,
      specs: editProduct.specs.filter(s => s.name !== nameToDelete)
    });
  };

  // Add Feature text to product
  const addProductFeature = () => {
    if (!featureText || !editProduct) return;
    const currentFeatures = editProduct.features || [];
    setEditProduct({
      ...editProduct,
      features: [...currentFeatures, featureText]
    });
    setFeatureText('');
  };

  const removeProductFeature = (fIndex: number) => {
    if (!editProduct || !editProduct.features) return;
    setEditProduct({
      ...editProduct,
      features: editProduct.features.filter((_, idx) => idx !== fIndex)
    });
  };

  if (loading || !analytics) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="animate-spin text-gold-400 mx-auto" size={40} />
          <p className="font-display text-xs tracking-wider uppercase text-stone-500 font-bold">Synchronizing administrative logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-28 pb-20 px-6 md:px-12 font-display">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Welcome Headers */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8">
          <div>
            <div className="flex items-center gap-2 text-[#C5A059] text-xs font-bold uppercase tracking-wider font-display">
              <CheckCircle size={12} />
              EXECUTIVE PORTAL SECURE
            </div>
            <h1 className="text-3xl md:text-4xl text-white font-medium tracking-tight mt-1">
              Command Suite
            </h1>
            <p className="text-xs text-stone-500 uppercase tracking-widest mt-1">
              Administer products, inventory logs, vouchers, and inspect growth trends
            </p>
          </div>
          
          <button 
            onClick={fetchAnalytics}
            className="flex items-center gap-2 border border-white/10 hover:border-gold-400/40 rounded-full py-2.5 px-5 text-xs text-stone-300 hover:text-gold-400 transition-colors cursor-pointer bg-stone-900/40"
          >
            <RefreshCw size={12} />
            Sync Logs
          </button>
        </div>

        {/* Stripe Console Tab bars */}
        <div className="flex flex-wrap gap-2.5 border-b border-white/5 pb-2">
          {([
            { id: 'metrics', label: 'Dashboard Home', icon: <TrendingUp size={14} /> },
            { id: 'products', label: 'Master Catalog', icon: <ShoppingBag size={14} /> },
            { id: 'categories', label: 'Division Segments', icon: <Layers size={14} /> },
            { id: 'orders', label: 'Client Orders', icon: <Archive size={14} /> },
            { id: 'coupons', label: 'Vouchers & Coupons', icon: <Tag size={14} /> },
            { id: 'banners', label: 'Campaign Showcases', icon: <Image size={14} /> }
          ] as const).map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-5 text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-gold-500 text-black font-extrabold shadow-lg shadow-gold-500/10'
                  : 'text-stone-400 hover:text-white hover:bg-stone-900/60'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Dynamic Panels */}
        <AnimatePresence mode="wait">
          
          {/* TAB 1: METRICS */}
          {activeTab === 'metrics' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8"
            >
              {/* Stripe Style Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Total Revenue */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-stone-500">
                    <span className="text-[10px] uppercase font-bold tracking-widest">Total Settle Volume</span>
                    <DollarSign size={14} className="text-[#C5A059]" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold font-mono text-white">
                      ${analytics.totalRevenue.toLocaleString()}
                    </h3>
                    <p className="text-[10px] text-green-400 mt-1 flex items-center gap-1">
                      <TrendingUp size={10} />
                      +{analytics.monthlyGrowth}% Growth rate
                    </p>
                  </div>
                </div>

                {/* Orders count */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-stone-500">
                    <span className="text-[10px] uppercase font-bold tracking-widest">Invoices Processed</span>
                    <ShoppingBag size={14} className="text-[#C5A059]" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold font-mono text-white">
                      {analytics.ordersCount}
                    </h3>
                    <p className="text-[10px] text-stone-400 mt-1">
                      Average invoice ticket: ${(analytics.totalRevenue / (analytics.ordersCount || 1)).toFixed(0)}
                    </p>
                  </div>
                </div>

                {/* Customer registrations */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-stone-500">
                    <span className="text-[10px] uppercase font-bold tracking-widest">Registered Clients</span>
                    <Users size={14} className="text-[#C5A059]" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold font-mono text-white">
                      {analytics.customersCount}
                    </h3>
                    <p className="text-[10px] text-[#C5A059] mt-1 font-bold">
                      Verified email rate: 100%
                    </p>
                  </div>
                </div>

                {/* Conversion Rate */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <div className="flex justify-between items-center text-stone-500">
                    <span className="text-[10px] uppercase font-bold tracking-widest">Conversion Ratio</span>
                    <TrendingUp size={14} className="text-[#C5A059]" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold font-mono text-white">
                      {analytics.conversionRate}%
                    </h3>
                    <p className="text-[10px] text-stone-400 mt-1">
                      Standard industry scale: 1.8%
                    </p>
                  </div>
                </div>

              </div>

              {/* Vector Interactive Charts Rows */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Chart A: Line Chart of volume */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold">Settle volume trend</h3>
                    <p className="text-lg text-white font-medium mt-0.5">L7 Dynamic Turnovers</p>
                  </div>

                  {/* Fully structured custom responsive SVG Chart */}
                  <div className="h-64 mt-6 w-full flex items-end justify-between px-2 pt-4 relative bg-stone-950/20 rounded-2xl overflow-hidden">
                    <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
                      {[1,2,3,4].map(gridLine => (
                        <div key={gridLine} className="border-b border-white/5 w-full h-full" />
                      ))}
                    </div>

                    <svg className="absolute inset-0 w-full h-full p-2" preserveAspectRatio="none">
                      {/* Grid lines or line paths */}
                      <path
                        d={`M 0,250 ${analytics.revenueTrend.map((t, idx) => {
                          const x = (idx / (analytics.revenueTrend.length - 1)) * 450;
                          const y = 200 - Math.min(180, (t.amount / (Math.max(...analytics.revenueTrend.map(v => v.amount)) || 1)) * 150);
                          return `L ${x},${y}`;
                        }).join(' ')}`}
                        fill="none"
                        stroke="#C5A059"
                        strokeWidth="2.5"
                        className="transition-all duration-1000"
                      />
                    </svg>

                    {analytics.revenueTrend.map((t, idx) => (
                      <div key={idx} className="flex-1 flex flex-col justify-end items-center h-full group z-10">
                        <div className="opacity-0 group-hover:opacity-100 absolute bg-stone-900 border border-white/10 text-[10px] p-2 rounded-xl text-gold-400 font-mono -translate-y-20 transition-all duration-300 pointer-events-none">
                          Sales: ${t.amount.toLocaleString()}
                        </div>
                        <div className="w-1.5 h-1.5 bg-gold-400 rounded-full mb-1 border border-black shadow group-hover:scale-150 transition-all" />
                        <span className="text-[10px] text-stone-500 font-mono mt-1 opacity-80">{t.date}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Chart B: Category Performance Bars */}
                <div className="glass-card p-6 rounded-2xl space-y-4">
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold">Division performance</h3>
                    <p className="text-lg text-white font-medium mt-0.5">Revenue Spread per Segment</p>
                  </div>

                  <div className="space-y-4 pt-4">
                    {analytics.categoryPerformance.map((item, idx) => {
                      const maxVal = Math.max(...analytics.categoryPerformance.map(v => v.value)) || 1;
                      const ratio = (item.value / maxVal) * 100;

                      return (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-stone-300 uppercase tracking-wide">{item.category}</span>
                            <span className="text-white font-mono font-bold">${item.value.toLocaleString()}</span>
                          </div>
                          <div className="h-2 w-full bg-stone-900 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${ratio}%` }}
                              transition={{ duration: 1, ease: 'easeOut' }}
                              className="h-full bg-gradient-to-r from-[#C5A059] to-[#ebdcb9] rounded-full"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* Top Selling Products */}
              <div className="glass-card p-6 rounded-2xl">
                <div className="mb-4">
                  <h3 className="text-xs uppercase tracking-widest text-stone-500 font-bold">Best seller rank</h3>
                  <p className="text-lg text-white font-medium mt-0.5">Top 5 Luxury Catalog Masterpieces</p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 text-stone-500 uppercase tracking-widest text-[9px]">
                        <th className="py-3 px-4">Masterpiece Name</th>
                        <th className="py-3 px-4 text-center">Units Sold</th>
                        <th className="py-3 px-4 text-right">Attributed revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {analytics.topProducts.map((prod, idx) => (
                        <tr key={idx} className="hover:bg-stone-900/20 transition-colors">
                          <td className="py-3.5 px-4 font-medium text-white">{prod.name}</td>
                          <td className="py-3.5 px-4 text-center text-stone-300 font-mono">{prod.sales || 0} pieces</td>
                          <td className="py-3.5 px-4 text-right text-gold-400 font-mono font-bold">${(prod.revenue || 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* STACK ENGINE INTEGRATION VIEWER */}
              <div className="glass-card p-6 rounded-2xl border border-white/5 space-y-6 mt-8">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h3 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">Ledger Stack Inspector</h3>
                    <p className="text-sm text-white font-medium mt-0.5">Live MongoDB, Express.js & Next.js Curation Cluster</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-left">
                  {/* Column A: MongoDB Status */}
                  <div className="space-y-3 bg-stone-900/30 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center text-stone-400">
                      <span className="uppercase tracking-widest text-[9px] font-bold">Database Instance</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[9px]">● CONNECTED</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>Cluster:</span>
                        <span className="text-stone-300">LUXORA-MONGODB (Primary)</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>Latency:</span>
                        <span className="text-stone-300">1.2ms</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>Storage Limit:</span>
                        <span className="text-stone-300">512 MB (Dev Tier)</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>Storage Used:</span>
                        <span className="text-stone-300">3.8 MB (0.74%)</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex gap-2">
                      <span className="bg-[#C5A059]/10 text-[#C5A059] text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">MongoDB v6.0</span>
                      <span className="bg-emerald-500/10 text-emerald-400 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">Mongoose Client</span>
                    </div>
                  </div>

                  {/* Column B: Backend Server Status */}
                  <div className="space-y-3 bg-stone-900/30 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center text-stone-400">
                      <span className="uppercase tracking-widest text-[9px] font-bold">API Server Engine</span>
                      <span className="text-emerald-400 flex items-center gap-1 font-mono text-[9px]">● ONLINE</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>Environment:</span>
                        <span className="text-stone-300">Node JS / Express v4</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>Binding Host:</span>
                        <span className="text-stone-300">0.0.0.0:3000</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>Reverse Proxy:</span>
                        <span className="text-stone-300">Nginx Edge Ingress</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>Middlewares:</span>
                        <span className="text-stone-300">Vite-SSR-HMR, JWT Guard</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex gap-2">
                      <span className="bg-[#C5A059]/10 text-[#C5A059] text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">Bearer Auth</span>
                      <span className="bg-gold-500/15 text-gold-400 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">Express Router</span>
                    </div>
                  </div>

                  {/* Column C: Next.js Frontend Proxies */}
                  <div className="space-y-3 bg-stone-900/30 p-4 rounded-xl border border-white/5">
                    <div className="flex justify-between items-center text-stone-400">
                      <span className="uppercase tracking-widest text-[9px] font-bold">UI Frontend Layer</span>
                      <span className="text-[#C5A059] flex items-center gap-1 font-mono text-[9px]">● HYDRATED</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>UI Platform:</span>
                        <span className="text-stone-300">Next.js 15.1 / App Router</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>CSS Framework:</span>
                        <span className="text-stone-300">Tailwind CSS v4.0</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>Motion Engine:</span>
                        <span className="text-stone-300">Framer Motion Active</span>
                      </div>
                      <div className="flex justify-between font-mono text-[10px] text-stone-500">
                        <span>Caching Layer:</span>
                        <span className="text-stone-300">Vercel Edge CDN Proxies</span>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-white/5 flex gap-2">
                      <span className="bg-sky-500/10 text-sky-400 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">React v19.0</span>
                      <span className="bg-violet-500/10 text-violet-400 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full font-bold">Vite Bundler</span>
                    </div>
                  </div>
                </div>
              </div>

            </motion.div>
          )}

          {/* TAB 2: PRODUCTS CATALOG (CRUD) */}
          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg text-white font-medium">Vault Catalog Materials</h3>
                <button
                  onClick={() => setEditProduct({
                    name: '',
                    description: '',
                    price: 2500,
                    category: categoriesList[0]?.slug || 'timepieces',
                    images: [],
                    inventory: 10,
                    specs: [],
                    features: []
                  })}
                  className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#D4B57A] text-black font-display text-xs font-bold uppercase tracking-widest rounded-full py-2.5 px-5 transition-all cursor-pointer"
                >
                  <Plus size={12} />
                  Add New Masterpiece
                </button>
              </div>

              {/* Product Form Drawer/dialog if editing */}
              <AnimatePresence>
                {editProduct && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 bg-stone-900 rounded-2xl border border-[#C5A059]/20 space-y-6 overflow-hidden"
                  >
                    <div className="flex justify-between items-center border-b border-white/5 pb-3">
                      <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                        {editProduct.id ? `Adjust Specs: ${editProduct.name}` : 'Instantiate Masterpiece'}
                      </h4>
                      <button onClick={() => setEditProduct(null)} className="text-stone-400 hover:text-white">
                        <X size={16} />
                      </button>
                    </div>

                    <form onSubmit={saveProductSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1.5">Asset Title</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Onyx Chronograph Royal"
                            value={editProduct.name || ''}
                            onChange={(e) => setEditProduct({ ...editProduct, name: e.target.value })}
                            className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1.5">Description Narrative</label>
                          <textarea
                            rows={3}
                            placeholder="Detailed marketing lore..."
                            value={editProduct.description || ''}
                            onChange={(e) => setEditProduct({ ...editProduct, description: e.target.value })}
                            className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1.5">Curated Valuation ($)</label>
                            <input
                              type="number"
                              required
                              value={editProduct.price || 0}
                              onChange={(e) => setEditProduct({ ...editProduct, price: parseFloat(e.target.value) })}
                              className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1.5">Stock Allocation</label>
                            <input
                              type="number"
                              required
                              value={editProduct.inventory || 0}
                              onChange={(e) => setEditProduct({ ...editProduct, inventory: parseInt(e.target.value) })}
                              className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1.5">Category Segment</label>
                            <select
                              value={editProduct.category || ''}
                              onChange={(e) => setEditProduct({ ...editProduct, category: e.target.value })}
                              className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-stone-300"
                            >
                              {categoriesList.map(c => (
                                <option key={c.id} value={c.slug}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1.5">Cloudinary uploads</label>
                            <button
                              type="button"
                              onClick={() => handleSimulatedImageUpload('images')}
                              className="w-full bg-stone-950 border border-white/5 hover:border-gold-500/40 rounded-xl py-3 text-xs text-stone-400 hover:text-gold-400 transition-colors cursor-pointer text-center"
                            >
                              Mock Camera Upload
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        {/* Specifications manager */}
                        <div>
                          <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1.5">Product Specifications</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Name (e.g. Diamenter)"
                              value={specName}
                              onChange={(e) => setSpecName(e.target.value)}
                              className="bg-stone-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white w-1/2"
                            />
                            <input
                              type="text"
                              placeholder="Value (e.g. 41mm)"
                              value={specValue}
                              onChange={(e) => setSpecValue(e.target.value)}
                              className="bg-stone-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white w-1/2"
                            />
                            <button
                              type="button"
                              onClick={addProductSpec}
                              className="bg-gold-500 text-black px-4 rounded-xl text-xs font-bold"
                            >
                              +
                            </button>
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {(editProduct.specs || []).map((spec, sIdx) => (
                              <span key={sIdx} className="bg-stone-950 text-stone-300 text-[10px] py-1 px-2.5 rounded-full border border-white/5 flex items-center gap-1">
                                {spec.name}: {spec.value}
                                <X size={10} className="hover:text-rose-400 cursor-pointer" onClick={() => removeProductSpec(spec.name)} />
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Features array manager */}
                        <div>
                          <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1.5 font-bold">Key features</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Feature (e.g. Handmade tourbillon)"
                              value={featureText}
                              onChange={(e) => setFeatureText(e.target.value)}
                              className="bg-stone-950 border border-white/5 rounded-xl py-2 px-3 text-xs text-white flex-1"
                            />
                            <button
                              type="button"
                              onClick={addProductFeature}
                              className="bg-gold-500 text-black px-4 rounded-xl text-xs font-bold"
                            >
                              +
                            </button>
                          </div>

                          <div className="space-y-1 mt-2 max-h-24 overflow-y-auto">
                            {(editProduct.features || []).map((feat, fIdx) => (
                              <div key={fIdx} className="bg-stone-950 text-stone-300 text-[10px] py-1.5 px-3 rounded-lg border border-white/5 flex justify-between items-center">
                                <span className="truncate">{feat}</span>
                                <X size={10} className="text-stone-500 hover:text-rose-400 cursor-pointer" onClick={() => removeProductFeature(fIdx)} />
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => setEditProduct(null)}
                            className="border border-white/5 hover:bg-stone-800 text-stone-300 rounded-xl py-2.5 px-5 text-xs transition-colors cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            type="submit"
                            className="bg-gold-500 text-black rounded-xl py-2.5 px-6 text-xs font-bold cursor-pointer"
                          >
                            Commit Masterpiece Specs
                          </button>
                        </div>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Products Table */}
              <div className="glass-card rounded-2xl overflow-hidden mt-4">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-stone-500 uppercase tracking-widest text-[9px]">
                      <th className="py-3 px-4">Catalog asset</th>
                      <th className="py-3 px-4">Segment</th>
                      <th className="py-3 px-4">Retail rate</th>
                      <th className="py-3 px-4">Vault inventory</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-display">
                    {productsList.map(prod => (
                      <tr key={prod.id} className="hover:bg-stone-900/10 transition-colors">
                        <td className="py-4 px-4 flex items-center gap-3">
                          <img src={prod.images[0]} alt={prod.name} className="w-10 h-10 object-cover rounded-lg" />
                          <div>
                            <p className="font-semibold text-white">{prod.name}</p>
                            <p className="text-[10px] text-stone-500 font-mono">SKU: {prod.id}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-stone-300 uppercase tracking-wide text-[10px]">{prod.category}</td>
                        <td className="py-4 px-4 text-gold-400 font-mono font-bold">${prod.price.toLocaleString()}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-2">
                            <span className={`font-mono font-semibold ${prod.inventory <= 5 ? 'text-amber-400 font-bold' : 'text-stone-300'}`}>
                              {prod.inventory} units
                            </span>
                            {prod.inventory <= 5 && (
                              <span className="text-amber-500 flex items-center gap-0.5 text-[9px] uppercase tracking-widest font-bold">
                                <AlertTriangle size={10} /> Low
                              </span>
                            )}
                          </div>
                          {/* Replenish Quick Panel */}
                          <div className="flex gap-1.5 mt-1">
                            <button
                              onClick={() => replenishStock(prod, 10)}
                              className="text-[8px] bg-stone-850 hover:bg-stone-800 text-stone-400 rounded py-0.5 px-1.5 border border-white/5 uppercase"
                            >
                              +10 Vault
                            </button>
                            <button
                              onClick={() => replenishStock(prod, 25)}
                              className="text-[8px] bg-stone-850 hover:bg-stone-800 text-stone-400 rounded py-0.5 px-1.5 border border-white/5 uppercase"
                            >
                              +25 Vault
                            </button>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex justify-end gap-2 text-stone-400">
                            <button onClick={() => setEditProduct(prod)} className="hover:text-gold-400 transition-colors cursor-pointer">
                              <Edit size={14} />
                            </button>
                            <button onClick={() => deleteProductItem(prod.id)} className="hover:text-rose-400 transition-colors cursor-pointer">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 3: DIVISION SEGMENTS (Categories CRUD) */}
          {activeTab === 'categories' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg text-white font-medium">Segment Divisions</h3>
                <button
                  onClick={() => setEditCategory({ name: '', slug: '', description: '', image: '' })}
                  className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#D4B57A] text-black font-display text-xs font-bold uppercase tracking-widest rounded-full py-2.5 px-5 transition-all cursor-pointer"
                >
                  <Plus size={12} />
                  Add Division Segment
                </button>
              </div>

              {/* Drawer category */}
              <AnimatePresence>
                {editCategory && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-6 bg-stone-900 rounded-2xl border border-[#C5A059]/20 space-y-6 overflow-hidden max-w-xl mx-auto"
                  >
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider border-b border-white/5 pb-2">
                      {editCategory.id ? 'Modify Division Segment' : 'Create Novel Segment'}
                    </h4>

                    <form onSubmit={saveCategorySubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Segment Name</label>
                        <input
                          type="text"
                          required
                          value={editCategory.name || ''}
                          onChange={(e) => setEditCategory({ ...editCategory, name: e.target.value })}
                          className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">URL Identifier Slug</label>
                        <input
                          type="text"
                          required
                          value={editCategory.slug || ''}
                          onChange={(e) => setEditCategory({ ...editCategory, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                          className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Conceptual Description</label>
                        <textarea
                          rows={2}
                          value={editCategory.description || ''}
                          onChange={(e) => setEditCategory({ ...editCategory, description: e.target.value })}
                          className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Photographic Showcase Address</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            placeholder="URL link"
                            value={editCategory.image || ''}
                            onChange={(e) => setEditCategory({ ...editCategory, image: e.target.value })}
                            className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-stone-300 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleSimulatedImageUpload('image')}
                            className="bg-stone-850 hover:bg-stone-800 text-stone-300 py-2.5 px-4 text-xs rounded-xl border border-white/5 cursor-pointer"
                          >
                            Cloudinary Mock
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setEditCategory(null)}
                          className="border border-white/5 hover:bg-stone-800 text-stone-300 rounded-xl py-2.5 px-5 text-xs transition-colors cursor-pointer"
                        >
                          Dismiss
                        </button>
                        <button
                          type="submit"
                          className="bg-gold-500 text-black rounded-xl py-2.5 px-6 text-xs font-bold cursor-pointer"
                        >
                          Commit Division
                        </button>
                      </div>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Categories Grid Table */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {categoriesList.map(cat => (
                  <div key={cat.id} className="glass-card rounded-2xl overflow-hidden group">
                    <div className="h-32 bg-stone-950 overflow-hidden relative">
                      <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60" />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal to-transparent" />
                      <div className="absolute bottom-3 left-4">
                        <h4 className="font-semibold text-white tracking-tight uppercase text-xs">{cat.name}</h4>
                        <span className="text-[9px] text-[#C5A059] font-mono leading-none font-bold uppercase">{cat.slug}</span>
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      <p className="text-[10px] text-stone-400 leading-relaxed font-light line-clamp-2 h-8">{cat.description}</p>
                      <div className="flex justify-end gap-3 text-stone-500 border-t border-white/5 pt-3">
                        <button onClick={() => setEditCategory(cat)} className="hover:text-gold-400 transition-colors cursor-pointer">
                          <Edit size={12} />
                        </button>
                        <button onClick={() => deleteCategoryItem(cat.id)} className="hover:text-rose-400 transition-colors cursor-pointer">
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* TAB 4: ORDERS CONTROL */}
          {activeTab === 'orders' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-4"
            >
              <h3 className="text-lg text-white font-medium">Global Client Order Invoices</h3>

              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-stone-500 uppercase tracking-widest text-[9px]">
                      <th className="py-3 px-4">Invoice ID</th>
                      <th className="py-3 px-4">Client Address</th>
                      <th className="py-3 px-4 text-center">Items count</th>
                      <th className="py-3 px-4">Valuation (USD)</th>
                      <th className="py-3 px-4">Delivery estimate</th>
                      <th className="py-3 px-4 text-right">Progress Tracking status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {ordersList.map(order => (
                      <tr key={order.id} className="hover:bg-stone-900/10 transition-colors">
                        <td className="py-4.5 px-4 font-mono font-bold text-white">{order.id}</td>
                        <td className="py-4.5 px-4">
                          <p className="font-semibold text-stone-200">{order.shippingAddress.fullName}</p>
                          <p className="text-[10px] text-stone-500">{order.shippingAddress.city}, {order.shippingAddress.country}</p>
                        </td>
                        <td className="py-4.5 px-4 text-center text-stone-300 font-mono">{order.items.reduce((tot, i) => tot + i.quantity, 0)} units</td>
                        <td className="py-4.5 px-4 text-gold-400 font-mono font-bold">${order.total.toLocaleString()}</td>
                        <td className="py-4.5 px-4 text-[10px] text-stone-400">{new Date(order.estimatedDelivery).toLocaleDateString()}</td>
                        <td className="py-4.5 px-4 text-right">
                          <select
                            value={order.trackingStatus}
                            onChange={(e) => handleOrderStatusChange(order.id, e.target.value)}
                            className="bg-stone-950 border border-white/10 text-gold-400 hover:border-gold-400 font-display text-[10px] uppercase font-bold tracking-wider rounded-lg p-2 focus:outline-none"
                          >
                            <option value="placed">Placed</option>
                            <option value="processing">Processing</option>
                            <option value="packed">Packed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivery">Out For Delivery</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 5: COUPON RULES */}
          {activeTab === 'coupons' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg text-white font-medium">Coupon codes & Campaigns</h3>
                <button
                  onClick={() => setEditCoupon({ code: '', type: 'percentage', value: 10, usageLimit: 100, active: true })}
                  className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#D4B57A] text-black font-display text-xs font-bold uppercase tracking-widest rounded-full py-2.5 px-5 transition-all cursor-pointer"
                >
                  <Plus size={12} />
                  Assemble Coupon
                </button>
              </div>

              {/* Coupon editing modal */}
              {editCoupon && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/80" onClick={() => setEditCoupon(null)} />
                  <div className="relative w-full max-w-sm bg-stone-900 border border-[#C5A059]/20 rounded-3xl p-6 shadow-2xl z-20 space-y-4">
                    <h4 className="text-sm font-semibold text-white uppercase tracking-wider">Coupon properties</h4>
                    <form onSubmit={saveCouponSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Coupon code</label>
                        <input
                          type="text"
                          required
                          value={editCoupon.code || ''}
                          onChange={(e) => setEditCoupon({ ...editCoupon, code: e.target.value.toUpperCase() })}
                          className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white font-mono"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Type</label>
                          <select
                            value={editCoupon.type || 'percentage'}
                            onChange={(e) => setEditCoupon({ ...editCoupon, type: e.target.value as any })}
                            className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-stone-300"
                          >
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed Flat ($)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Deduction amount</label>
                          <input
                            type="number"
                            required
                            value={editCoupon.value || 0}
                            onChange={(e) => setEditCoupon({ ...editCoupon, value: parseFloat(e.target.value) })}
                            className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Usage allocation limits</label>
                        <input
                          type="number"
                          required
                          value={editCoupon.usageLimit || 0}
                          onChange={(e) => setEditCoupon({ ...editCoupon, usageLimit: parseInt(e.target.value) })}
                          className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                        />
                      </div>

                      <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setEditCoupon(null)}
                          className="border border-white/5 hover:bg-stone-800 text-stone-300 rounded-xl py-2 px-4 text-xs"
                        >
                          Dismiss
                        </button>
                        <button
                          type="submit"
                          className="bg-gold-500 text-black py-2 px-5 text-xs font-bold rounded-xl"
                        >
                          Launch Coupon
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Coupons List */}
              <div className="glass-card rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/5 text-stone-500 uppercase tracking-widest text-[9px]">
                      <th className="py-3 px-4">Coupon code</th>
                      <th className="py-3 px-4">Benefit calculation</th>
                      <th className="py-3 px-4">Inception allocations</th>
                      <th className="py-3 px-4">Usage tally</th>
                      <th className="py-3 px-4">Campaign visibility</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 font-mono">
                    {couponsList.map(coup => (
                      <tr key={coup.id} className="hover:bg-stone-900/10 transition-colors">
                        <td className="py-4.5 px-4 font-bold text-white tracking-wider">{coup.code}</td>
                        <td className="py-4.5 px-4 text-gold-400 font-bold">
                          {coup.type === 'percentage' ? `${coup.value}% Off` : `$${coup.value.toLocaleString()} Flat`}
                        </td>
                        <td className="py-4.5 px-4 text-stone-300">{coup.usageLimit} claims Max</td>
                        <td className="py-4.5 px-4 text-stone-300 font-bold">{coup.usageCount} claims</td>
                        <td className="py-4.5 px-4">
                          <span className={`inline-block text-[9px] uppercase tracking-widest py-1 px-3.5 rounded-full font-bold leading-none ${
                            coup.active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-stone-900 text-stone-600 border border-white/5'
                          }`}>
                            {coup.active ? 'Active' : 'Muted'}
                          </span>
                        </td>
                        <td className="py-4.5 px-4 text-right">
                          <div className="flex justify-end gap-3 text-stone-400">
                            <button onClick={() => setEditCoupon(coup)} className="hover:text-gold-400 cursor-pointer">
                              <Edit size={12} />
                            </button>
                            <button onClick={() => deleteCouponItem(coup.id)} className="hover:text-rose-400 cursor-pointer">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB 6: BANNER CAMPAIGNS */}
          {activeTab === 'banners' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-lg text-white font-medium">Hompage sliders & Banner Visibility</h3>
                <button
                  onClick={() => setEditBanner({ title: '', subtitle: '', image: '', link: '/shop', active: true })}
                  className="flex items-center gap-2 bg-[#C5A059] hover:bg-[#D4B57A] text-black font-display text-xs font-bold uppercase tracking-widest rounded-full py-2.5 px-5 transition-all cursor-pointer"
                >
                  <Plus size={12} />
                  Create Campaign
                </button>
              </div>

              {/* Banner edit slider */}
              {editBanner && (
                <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
                  <div className="absolute inset-0 bg-black/80" onClick={() => setEditBanner(null)} />
                  <div className="relative w-full max-w-md bg-stone-900 border border-[#C5A059]/20 rounded-3xl p-6 shadow-2xl z-20 space-y-4">
                    <h4 className="text-xs uppercase tracking-widest text-[#C5A059] font-bold">Campaign Banner config</h4>
                    <form onSubmit={saveBannerSubmit} className="space-y-4">
                      <div>
                        <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Headline</label>
                        <input
                          type="text"
                          required
                          value={editBanner.title || ''}
                          onChange={(e) => setEditBanner({ ...editBanner, title: e.target.value })}
                          className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Subheadings summary</label>
                        <input
                          type="text"
                          value={editBanner.subtitle || ''}
                          onChange={(e) => setEditBanner({ ...editBanner, subtitle: e.target.value })}
                          className="w-full bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase text-stone-500 font-bold mb-1">Dynamic Image link</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            required
                            value={editBanner.image || ''}
                            onChange={(e) => setEditBanner({ ...editBanner, image: e.target.value })}
                            className="bg-stone-950 border border-white/5 rounded-xl py-3 px-4 text-xs text-stone-300 flex-1"
                          />
                          <button
                            type="button"
                            onClick={() => handleSimulatedImageUpload('image')}
                            className="bg-stone-850 hover:bg-stone-800 text-stone-300 py-2.5 px-4 text-xs rounded-xl border border-white/5 cursor-pointer"
                          >
                            Cloudinary
                          </button>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setEditBanner(null)}
                          className="border border-white/5 hover:bg-stone-800 text-stone-300 rounded-xl py-2 px-4 text-xs"
                        >
                          Dismiss
                        </button>
                        <button
                          type="submit"
                          className="bg-gold-500 text-black py-2 px-5 text-xs font-bold rounded-xl"
                        >
                          Schedule Campaign
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Banners display */}
              <div className="space-y-4">
                {bannersList.map(ban => (
                  <div key={ban.id} className="glass-card rounded-2xl overflow-hidden p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center gap-6 flex-1">
                      <img src={ban.image} alt={ban.title} className="w-24 h-24 object-cover rounded-xl" />
                      <div className="space-y-1">
                        <span className="text-[9px] text-[#C5A059] uppercase font-bold tracking-widest font-mono">Bespoke banner active</span>
                        <h4 className="text-base font-semibold text-white leading-tight">{ban.title}</h4>
                        <p className="text-xs text-stone-400 font-luxury italic leading-relaxed">{ban.subtitle}</p>
                      </div>
                    </div>

                    <div className="flex gap-4 items-center shrink-0">
                      <span className={`inline-block text-[9px] uppercase tracking-widest py-1 px-3.5 rounded-full font-bold leading-none ${
                        ban.active ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-stone-900 text-stone-600 border border-white/5'
                      }`}>
                        {ban.active ? 'Live Scheduled' : 'Deactivated'}
                      </span>
                      <div className="flex gap-2 text-stone-400">
                        <button onClick={() => setEditBanner(ban)} className="hover:text-gold-400 transition-colors cursor-pointer p-1">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => deleteBannerItem(ban.id)} className="hover:text-rose-400 transition-colors cursor-pointer p-1">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

      </div>
    </div>
  );
};
