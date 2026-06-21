/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { User, Address, Product, Category, Order, Coupon, Banner, Review, UserRole, AnalyticsSummary } from './types';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_COUPONS, INITIAL_BANNERS } from './initialData';

const STORE_FILE = path.join(process.cwd(), '_db_store.json');

interface DbSchemas {
  users: (User & { passwordHash: string })[];
  addresses: Address[];
  products: Product[];
  categories: Category[];
  orders: Order[];
  coupons: Coupon[];
  banners: Banner[];
  reviews: Review[];
  wishlist: { id: string; userId: string; productId: string; addedAt: string }[];
  searchHistories: { userId: string; query: string; timestamp: string }[];
}

// Initial state of seed accounts: admin and some users
const DEFAULT_USER_PASSWORD_HASH = crypto.createHash('sha256').update('password123').digest('hex');

const INITIAL_USERS: (User & { passwordHash: string })[] = [
  {
    id: 'user_admin',
    email: 'admin@luxora.com',
    name: 'Sterling Archer',
    role: UserRole.ADMIN,
    createdAt: new Date('2026-01-01').toISOString(),
    passwordHash: DEFAULT_USER_PASSWORD_HASH
  },
  {
    id: 'user_regular',
    email: 'gnaga2409@gmail.com', // Pre-bootstrap user's email as active customer
    name: 'G. Naga',
    role: UserRole.USER,
    createdAt: new Date('2026-06-20').toISOString(),
    passwordHash: DEFAULT_USER_PASSWORD_HASH
  }
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev_1',
    productId: 'prod_1',
    userId: 'user_regular',
    userName: 'G. Naga',
    rating: 5,
    comment: 'The weight of this matte ceramic tourbillon is incredible. Keeps flawless sync, elegant design matches with any bespoke dark suit.',
    createdAt: new Date('2026-06-18T10:00:00Z').toISOString()
  },
  {
    id: 'rev_2',
    productId: 'prod_3',
    userId: 'user_regular',
    userName: 'G. Naga',
    rating: 5,
    comment: 'Acoustical spatial response is unmatched. Noise cancellation lets me focus perfectly on code in deep silence. Lambskin cuffs are incredibly soft.',
    createdAt: new Date('2026-06-19T14:30:00Z').toISOString()
  }
];

const INITIAL_ADDRESSES: Address[] = [
  {
    id: 'addr_1',
    userId: 'user_regular',
    fullName: 'G. Naga',
    phone: '+1 (555) 019-2834',
    streetAddress: '742 Platinum Boulevard, Penthouse 4B',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94105',
    country: 'United States',
    isDefault: true
  }
];

class DatabaseStore {
  private data: DbSchemas;

  constructor() {
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DbSchemas {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const fileContent = fs.readFileSync(STORE_FILE, 'utf8');
        return JSON.parse(fileContent);
      }
    } catch (error) {
      console.error('Failed to load local DB schema file:', error);
    }

    // Default seed
    const defaultDb: DbSchemas = {
      users: INITIAL_USERS,
      addresses: INITIAL_ADDRESSES,
      products: INITIAL_PRODUCTS,
      categories: INITIAL_CATEGORIES,
      orders: [],
      coupons: INITIAL_COUPONS,
      banners: INITIAL_BANNERS,
      reviews: INITIAL_REVIEWS,
      wishlist: [],
      searchHistories: []
    };

    this.saveDatabase(defaultDb);
    return defaultDb;
  }

  private saveDatabase(dbData: DbSchemas = this.data) {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(dbData, null, 2), 'utf8');
    } catch (error) {
      console.error('Failed to write database changes to disk:', error);
    }
  }

  // USERS
  getUsers() { return this.data.users; }
  getUserById(id: string) { return this.data.users.find(u => u.id === id); }
  getUserByEmail(email: string) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
  createUser(user: User & { passwordHash: string }) {
    this.data.users.push(user);
    this.saveDatabase();
    return user;
  }

  // ADDRESSES
  getAddresses(userId: string) {
    return this.data.addresses.filter(a => a.userId === userId);
  }
  addAddress(address: Address) {
    if (address.isDefault) {
      // unset other defaults for this user
      this.data.addresses.forEach(a => {
        if (a.userId === address.userId) a.isDefault = false;
      });
    }
    this.data.addresses.push(address);
    this.saveDatabase();
    return address;
  }
  updateAddress(userId: string, id: string, updates: Partial<Address>) {
    const idx = this.data.addresses.findIndex(a => a.id === id && a.userId === userId);
    if (idx !== -1) {
      if (updates.isDefault) {
        this.data.addresses.forEach(a => {
          if (a.userId === userId) a.isDefault = false;
        });
      }
      this.data.addresses[idx] = { ...this.data.addresses[idx], ...updates } as Address;
      this.saveDatabase();
      return this.data.addresses[idx];
    }
    return null;
  }
  deleteAddress(userId: string, id: string) {
    const initialLen = this.data.addresses.length;
    this.data.addresses = this.data.addresses.filter(a => !(a.id === id && a.userId === userId));
    this.saveDatabase();
    return this.data.addresses.length < initialLen;
  }

  // PRODUCTS
  getProducts() { return this.data.products; }
  getProductById(id: string) { return this.data.products.find(p => p.id === id); }
  createProduct(product: Product) {
    this.data.products.push(product);
    this.saveDatabase();
    return product;
  }
  updateProduct(id: string, updates: Partial<Product>) {
    const idx = this.data.products.findIndex(p => p.id === id);
    if (idx !== -1) {
      this.data.products[idx] = { ...this.data.products[idx], ...updates } as Product;
      this.saveDatabase();
      return this.data.products[idx];
    }
    return null;
  }
  deleteProduct(id: string) {
    const startSize = this.data.products.length;
    this.data.products = this.data.products.filter(p => p.id !== id);
    this.saveDatabase();
    return this.data.products.length < startSize;
  }

  // CATEGORIES
  getCategories() { return this.data.categories; }
  createCategory(category: Category) {
    this.data.categories.push(category);
    this.saveDatabase();
    return category;
  }
  updateCategory(id: string, updates: Partial<Category>) {
    const idx = this.data.categories.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.categories[idx] = { ...this.data.categories[idx], ...updates };
      this.saveDatabase();
      return this.data.categories[idx];
    }
    return null;
  }
  deleteCategory(id: string) {
    const startSize = this.data.categories.length;
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.saveDatabase();
    return this.data.categories.length < startSize;
  }

  // ORDERS
  getOrders() { return this.data.orders; }
  getOrdersByUserId(userId: string) {
    return this.data.orders.filter(o => o.userId === userId);
  }
  getOrderById(id: string) {
    return this.data.orders.find(o => o.id === id);
  }
  createOrder(order: Order) {
    this.data.orders.push(order);
    // Deduct inventory
    order.items.forEach(item => {
      const p = this.getProductById(item.product.id);
      if (p) {
        p.inventory = Math.max(0, p.inventory - item.quantity);
      }
    });
    this.saveDatabase();
    return order;
  }
  updateOrderStatus(orderId: string, status: Order['trackingStatus']) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (order) {
      order.trackingStatus = status;
      this.saveDatabase();
      return order;
    }
    return null;
  }

  // COUPONS
  getCoupons() { return this.data.coupons; }
  getCouponByCode(code: string) {
    return this.data.coupons.find(c => c.code.toUpperCase() === code.trim().toUpperCase());
  }
  createCoupon(coupon: Coupon) {
    this.data.coupons.push(coupon);
    this.saveDatabase();
    return coupon;
  }
  updateCoupon(id: string, updates: Partial<Coupon>) {
    const idx = this.data.coupons.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.data.coupons[idx] = { ...this.data.coupons[idx], ...updates };
      this.saveDatabase();
      return this.data.coupons[idx];
    }
    return null;
  }
  deleteCoupon(id: string) {
    const start = this.data.coupons.length;
    this.data.coupons = this.data.coupons.filter(c => c.id !== id);
    this.saveDatabase();
    return this.data.coupons.length < start;
  }

  // BANNERS
  getBanners() { return this.data.banners; }
  createBanner(banner: Banner) {
    this.data.banners.push(banner);
    this.saveDatabase();
    return banner;
  }
  updateBanner(id: string, updates: Partial<Banner>) {
    const idx = this.data.banners.findIndex(b => b.id === id);
    if (idx !== -1) {
      this.data.banners[idx] = { ...this.data.banners[idx], ...updates };
      this.saveDatabase();
      return this.data.banners[idx];
    }
    return null;
  }
  deleteBanner(id: string) {
    const start = this.data.banners.length;
    this.data.banners = this.data.banners.filter(b => b.id !== id);
    this.saveDatabase();
    return this.data.banners.length < start;
  }

  // REVIEWS
  getReviewsByProduct(productId: string) {
    return this.data.reviews.filter(r => r.productId === productId);
  }
  addReview(review: Review) {
    this.data.reviews.push(review);
    // Recalculate average rating for product
    const p = this.getProductById(review.productId);
    if (p) {
      const pReviews = this.getReviewsByProduct(review.productId);
      const totalScore = pReviews.reduce((sum, r) => sum + r.rating, 0);
      p.rating = parseFloat((totalScore / pReviews.length).toFixed(1));
      p.reviewsCount = pReviews.length;
    }
    this.saveDatabase();
    return review;
  }

  // WISHLIST
  getWishlist(userId: string) {
    return this.data.wishlist.filter(w => w.userId === userId);
  }
  addToWishlist(userId: string, productId: string) {
    const exists = this.data.wishlist.some(w => w.userId === userId && w.productId === productId);
    if (!exists) {
      const item = {
        id: 'wish_' + Math.random().toString(36).substring(2, 11),
        userId,
        productId,
        addedAt: new Date().toISOString()
      };
      this.data.wishlist.push(item);
      this.saveDatabase();
      return item;
    }
    return null;
  }
  removeFromWishlist(userId: string, productId: string) {
    const startLen = this.data.wishlist.length;
    this.data.wishlist = this.data.wishlist.filter(w => !(w.userId === userId && w.productId === productId));
    this.saveDatabase();
    return this.data.wishlist.length < startLen;
  }

  // SEARCH HISTORIES
  getSearchHistory(userId: string) {
    return this.data.searchHistories
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5); // top 5
  }
  addSearchHistory(userId: string, query: string) {
    if (!query.trim()) return;
    // Remove if duplicates exist to move to top
    this.data.searchHistories = this.data.searchHistories.filter(
      s => !(s.userId === userId && s.query.toLowerCase() === query.trim().toLowerCase())
    );
    this.data.searchHistories.push({
      userId,
      query: query.trim(),
      timestamp: new Date().toISOString()
    });
    this.saveDatabase();
  }
  clearSearchHistory(userId: string) {
    this.data.searchHistories = this.data.searchHistories.filter(s => s.userId !== userId);
    this.saveDatabase();
  }

  // ANALYTICS (Stripe dashboard style)
  getAnalytics(): AnalyticsSummary {
    const orders = this.data.orders.filter(o => o.paymentStatus === 'paid');
    
    // Revenue metrics
    const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
    const ordersCount = this.data.orders.length;
    const customersCount = this.data.users.length;
    const productsCount = this.data.products.length;

    // Revenue trend (last 7 days)
    const revenueTrend: { date: string; amount: number }[] = [];
    const salesTrend: { date: string; count: number }[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      
      const dayOrders = this.data.orders.filter(o => {
        const oDate = new Date(o.createdAt);
        return oDate.toDateString() === date.toDateString();
      });
      
      const dayPaidOrders = dayOrders.filter(o => o.paymentStatus === 'paid');
      const dayRevenue = dayPaidOrders.reduce((sum, o) => sum + o.total, 0);

      revenueTrend.push({ date: dateString, amount: dayRevenue });
      salesTrend.push({ date: dateString, count: dayOrders.length });
    }

    // Category Performance
    const categoryTotals: { [key: string]: number } = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const cat = item.product.category;
        categoryTotals[cat] = (categoryTotals[cat] || 0) + (item.product.price * item.quantity);
      });
    });

    const categoryPerformance = this.data.categories.map(c => ({
      category: c.name,
      value: categoryTotals[c.slug] || 0
    }));

    // Top Products
    const productSales: { [id: string]: { name: string; sales: number; revenue: number } } = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const p = item.product;
        if (!productSales[p.id]) {
          productSales[p.id] = { name: p.name, sales: 0, revenue: 0 };
        }
        productSales[p.id].sales += item.quantity;
        productSales[p.id].revenue += p.price * item.quantity;
      });
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Hardcode fallback top products if no orders exist yet
    if (topProducts.length === 0) {
      this.data.products.slice(0, 3).forEach(p => {
        topProducts.push({
          name: p.name,
          sales: 0,
          revenue: 0
        });
      });
    }

    return {
      totalRevenue,
      ordersCount,
      customersCount,
      productsCount,
      revenueTrend,
      salesTrend,
      categoryPerformance,
      topProducts,
      conversionRate: 3.4, // standard luxury conversion rate
      monthlyGrowth: 15.2
    };
  }
}

export const dbStore = new DatabaseStore();
