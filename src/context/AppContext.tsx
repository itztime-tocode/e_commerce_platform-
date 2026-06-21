/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Address, Product, Order, Coupon, Banner, OrderItem } from '../types';
import { api } from '../api';

export type PageId = 'home' | 'shop' | 'product-details' | 'cart' | 'checkout' | 'orders' | 'admin';

interface AppContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  navPage: PageId;
  selectedProductId: string | null;
  selectedOrder: Order | null;
  cart: OrderItem[];
  wishlist: Product[];
  addresses: Address[];
  coupons: Coupon[]; 
  banners: Banner[];
  categories: any[];
  appliedCoupon: Coupon | null;
  alert: { message: string; type: 'success' | 'error' | 'info' } | null;
  searchQuery: string;
  searchHistory: string[];
  
  // Auth actions
  login: (credentials: any) => Promise<void>;
  register: (details: any) => Promise<void>;
  logout: () => void;
  
  // Navigation & Details
  setNavPage: (page: PageId) => void;
  viewProductDetails: (id: string) => void;
  viewOrderDetails: (order: Order) => void;
  triggerAlert: (message: string, type: 'success' | 'error' | 'info') => void;
  clearAlert: () => void;
  
  // Cart operations
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  
  // Checkout & Coupon operations
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  saveOrder: (details: { shippingAddress: Address; paymentMethod: string }) => Promise<Order>;
  
  // User profile extensions
  loadAddresses: () => Promise<void>;
  addAddress: (addr: Omit<Address, 'id' | 'userId'>) => Promise<void>;
  removeAddress: (id: string) => Promise<void>;
  updateAddress: (id: string, addr: Partial<Address>) => Promise<void>;
  
  // Wishlist operations
  toggleWishlist: (product: Product) => Promise<void>;
  isInWishlist: (productId: string) => boolean;

  // General loaders
  loadWishlist: () => Promise<void>;
  loadSearchHistory: () => Promise<void>;
  setSearchQuery: (query: string) => void;
  loadProductCatalog: () => Promise<void>;
  catalogProducts: Product[];
  setCatalogProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cartDrawerOpen: boolean;
  setCartDrawerOpen: (open: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('luxora_token'));
  const [loading, setLoading] = useState<boolean>(true);
  const [navPage, setNavPage] = useState<PageId>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Dynamic collections
  const [catalogProducts, setCatalogProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Cart state loaded from cache
  const [cart, setCart] = useState<OrderItem[]>(() => {
    const cached = localStorage.getItem('luxora_cart');
    return cached ? JSON.parse(cached) : [];
  });
  
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [alert, setAlert] = useState<AppContextType['alert']>(null);
  const [cartDrawerOpen, setCartDrawerOpen] = useState<boolean>(false);

  // Trigger notice alerts
  const triggerAlert = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setAlert({ message, type });
    setTimeout(() => {
      setAlert(null);
    }, 4500);
  }, []);

  const clearAlert = () => setAlert(null);

  // Sync cart cash
  useEffect(() => {
    localStorage.setItem('luxora_cart', JSON.stringify(cart));
  }, [cart]);

  // Load profile on start
  const loadProfile = async (tk: string) => {
    try {
      setLoading(true);
      const userProfile = await api.auth.me();
      setUser(userProfile);
    } catch (err: any) {
      console.warn('Authentication token expired.', err);
      // Clean stale tokens
      localStorage.removeItem('luxora_token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Load General Global Assets
  const loadAppAssets = async () => {
    try {
      const [prods, cats, bans] = await Promise.all([
        api.products.list(),
        api.categories.list(),
        api.banners.list()
      ]);
      setCatalogProducts(prods);
      setCategories(cats);
      setBanners(bans);
    } catch (err) {
      console.error('Failed to load global store assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadProfile(token);
    } else {
      setLoading(false);
    }
    loadAppAssets();
  }, [token]);

  // Load user specific lists
  useEffect(() => {
    if (user) {
      loadAddresses();
      loadWishlist();
      loadSearchHistory();
    } else {
      setAddresses([]);
      setWishlist([]);
      setSearchHistory([]);
    }
  }, [user]);

  // Load Lists Helpers
  const loadAddresses = async () => {
    try {
      const list = await api.addresses.list();
      setAddresses(list);
    } catch (err) {
      console.error('Failed to load user addresses:', err);
    }
  };

  const loadWishlist = async () => {
    try {
      const list = await api.wishlist.list();
      setWishlist(list);
    } catch (err) {
      console.error('Failed to load wishlist:', err);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const list = await api.searchHistory.list();
      setSearchHistory(list);
    } catch (err) {
      console.error('Failed to load searches:', err);
    }
  };

  const loadProductCatalog = async () => {
    try {
      const prods = await api.products.list({ q: searchQuery });
      setCatalogProducts(prods);
    } catch (err) {
      console.error(err);
    }
  };

  // Authentication operations
  const login = async (credentials: any) => {
    try {
      setLoading(true);
      const res = await api.auth.login(credentials);
      localStorage.setItem('luxora_token', res.token);
      setToken(res.token);
      setUser(res.user);
      triggerAlert(`Welcome back, ${res.user.name}. Elite access granted.`, 'success');
      setNavPage('home');
    } catch (err: any) {
      triggerAlert(err.message || 'Login attempt failed.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (details: any) => {
    try {
      setLoading(true);
      const res = await api.auth.register(details);
      localStorage.setItem('luxora_token', res.token);
      setToken(res.token);
      setUser(res.user);
      triggerAlert(`Welcome to LUXORA, ${res.user.name}. Membership profile created.`, 'success');
      setNavPage('home');
    } catch (err: any) {
      triggerAlert(err.message || 'Registration failed.', 'error');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('luxora_token');
    setToken(null);
    setUser(null);
    setCart([]);
    setAppliedCoupon(null);
    setNavPage('home');
    triggerAlert('Signed out safely. We hope to see you back soon.', 'info');
  };

  // Core navigation methods
  const viewProductDetails = (id: string) => {
    setSelectedProductId(id);
    setNavPage('product-details');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setNavPage('orders');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Shopping cart logics
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prev => {
      const existingIdx = prev.findIndex(item => item.product.id === product.id);
      if (existingIdx !== -1) {
        const item = prev[existingIdx];
        const newQty = item.quantity + quantity;
        if (newQty > product.inventory) {
          triggerAlert(`Sorry, we can only allocate ${product.inventory} units for this exclusive item.`, 'error');
          return prev;
        }
        const updated = [...prev];
        updated[existingIdx] = { ...item, quantity: newQty };
        triggerAlert(`Added ${quantity}x ${product.name} to luxury cart.`, 'success');
        setCartDrawerOpen(true);
        return updated;
      } else {
        if (quantity > product.inventory) {
          triggerAlert(`Allocation issue: only ${product.inventory} units available.`, 'error');
          return prev;
        }
        triggerAlert(`Added ${product.name} to luxury cart.`, 'success');
        setCartDrawerOpen(true);
        return [...prev, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
    triggerAlert('Item removed from cart.', 'info');
  };

  const updateCartQuantity = (productId: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          if (qty > item.product.inventory) {
            triggerAlert(`Maximum catalog allocation reached (${item.product.inventory}).`, 'error');
            return item;
          }
          return { ...item, quantity: qty };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  // Coupon application
  const applyCoupon = async (code: string) => {
    try {
      const validCoupon = await api.coupons.validate(code);
      setAppliedCoupon(validCoupon);
      triggerAlert(`Code "${validCoupon.code}" applied. Golden rewards reduced!`, 'success');
    } catch (err: any) {
      triggerAlert(err.message || 'Coupon code mismatch.', 'error');
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    triggerAlert('Coupon discounts removed.', 'info');
  };

  // Save checkout order
  const saveOrder = async (details: { shippingAddress: Address; paymentMethod: string }): Promise<Order> => {
    if (!user) {
      triggerAlert('Secure sign-in is required to place order.', 'error');
      throw new Error('Unauthenticated ordering');
    }

    const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const discount = appliedCoupon 
      ? (appliedCoupon.type === 'percentage' ? (subtotal * appliedCoupon.value) / 100 : appliedCoupon.value)
      : 0;
    const tax = (subtotal - discount) * 0.0825; // 8.25% luxury surcharge
    const shippingCost = subtotal > 5000 ? 0 : 1500; // Complimentary shipping on premium purchases
    const total = subtotal - discount + tax + shippingCost;

    try {
      const newOrder = await api.orders.create({
        items: cart,
        subtotal,
        tax,
        shippingCost,
        discount,
        total,
        couponCode: appliedCoupon?.code,
        shippingAddress: details.shippingAddress,
        paymentMethod: details.paymentMethod
      });

      // Clear states
      clearCart();
      triggerAlert('Purchase authenticated. Luxury items scheduled for delivery.', 'success');
      viewOrderDetails(newOrder);
      
      // Update inventory on client catalog immediately
      loadAppAssets();
      
      return newOrder;
    } catch (err: any) {
      triggerAlert(err.message || 'A bottleneck occurred during checkout.', 'error');
      throw err;
    }
  };

  // User Profile Address Management Extensions
  const addAddress = async (addr: Omit<Address, 'id' | 'userId'>) => {
    try {
      await api.addresses.create(addr);
      await loadAddresses();
      triggerAlert('Shipping address added successfully.', 'success');
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to save address info.', 'error');
    }
  };

  const removeAddress = async (id: string) => {
    try {
      await api.addresses.delete(id);
      await loadAddresses();
      triggerAlert('Address purged.', 'info');
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to purge address.', 'error');
    }
  };

  const updateAddress = async (id: string, addr: Partial<Address>) => {
    try {
      await api.addresses.update(id, addr);
      await loadAddresses();
      triggerAlert('Shipping destination updated.', 'success');
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to update address components.', 'error');
    }
  };

  // Saved galleries (Wishlists)
  const toggleWishlist = async (product: Product) => {
    if (!user) {
      triggerAlert('Sign in to catalog your saved dreams.', 'error');
      return;
    }
    const exists = wishlist.some(item => item.id === product.id);
    try {
      if (exists) {
        await api.wishlist.delete(product.id);
        triggerAlert('Item removed from your personal museum.', 'info');
      } else {
        await api.wishlist.add(product.id);
        triggerAlert('Item archived in your personal museum.', 'success');
      }
      await loadWishlist();
    } catch (err: any) {
      triggerAlert(err.message || 'Failed to complete wishlist sync.', 'error');
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(item => item.id === productId);
  };

  return (
    <AppContext.Provider
      value={{
        user,
        token,
        loading,
        navPage,
        selectedProductId,
        selectedOrder,
        cart,
        wishlist,
        addresses,
        coupons,
        banners,
        categories,
        appliedCoupon,
        alert,
        searchQuery,
        searchHistory,
        catalogProducts,
        
        login,
        register,
        logout,
        setNavPage,
        viewProductDetails,
        viewOrderDetails,
        triggerAlert,
        clearAlert,
        
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        
        applyCoupon,
        removeCoupon,
        saveOrder,
        
        loadAddresses,
        addAddress,
        removeAddress,
        updateAddress,
        
        toggleWishlist,
        isInWishlist,
        loadWishlist,
        loadSearchHistory,
        setSearchQuery,
        loadProductCatalog,
        setCatalogProducts,
        cartDrawerOpen,
        setCartDrawerOpen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be parsed within an AppProvider wrapper Context.');
  }
  return context;
};
