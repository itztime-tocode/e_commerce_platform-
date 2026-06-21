/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './src/db';
import { UserRole, TrackingStatus } from './src/types';

const app = express();
const PORT = 3000;

// Enable JSON bodies
app.use(express.json({ limit: '20mb' }));

// CRYPTOGRAPHIC HELPER FOR SECURITY (Zero-Dependency Stateless User Authenticator)
const JWT_SECRET = process.env.JWT_SECRET || 'luxora_secret_gold_key_2026';

function signToken(payload: any): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Date.now() + 24 * 60 * 60 * 1000 })).toString('base64url');
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyToken(token: string): any | null {
  try {
    const [header, body, signature] = token.split('.');
    if (!header || !body || !signature) return null;
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && Date.now() > payload.exp) return null; // Expired
    return payload;
  } catch {
    return null;
  }
}

// User-Verifier Middlewares
const verifyUser = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(418).json({ error: 'Unauthenticated. High-end access token is required.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Access token has expired or is invalid.' });
    return;
  }

  // Bind token payload to request context
  (req as any).user = payload;
  next();
};

const verifyAdmin = (req: express.Request, res: express.Response, next: express.NextFunction): void => {
  verifyUser(req, res, () => {
    const userRole = (req as any).user?.role;
    if (userRole !== UserRole.ADMIN) {
      res.status(403).json({ error: 'Access Forbidden. Elite status required.' });
      return;
    }
    next();
  });
};

// ================= AUTHENTICATION APIS =================

// Register User
app.post('/api/auth/register', (req, res) => {
  const { email, password, name } = req.body;
  if (!email || !password || !name) {
    res.status(400).json({ error: 'All fields (name, email, password) are required.' });
    return;
  }

  const existing = dbStore.getUserByEmail(email);
  if (existing) {
    res.status(400).json({ error: 'Account already exists under this luxury address.' });
    return;
  }

  const id = 'user_' + Math.random().toString(36).substring(2, 11);
  const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
  const userRole = UserRole.USER; // defaults to customer role

  const newUser = dbStore.createUser({
    id,
    email,
    name,
    role: userRole,
    createdAt: new Date().toISOString(),
    passwordHash
  });

  const token = signToken({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name });

  res.status(201).json({
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt
    }
  });
});

// Login User
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required.' });
    return;
  }

  const user = dbStore.getUserByEmail(email);
  if (!user) {
    res.status(401).json({ error: 'No account registered with this email address.' });
    return;
  }

  const incomingHash = crypto.createHash('sha256').update(password).digest('hex');
  if (user.passwordHash !== incomingHash) {
    res.status(401).json({ error: 'The credentials supplied are incorrect.' });
    return;
  }

  const token = signToken({ id: user.id, email: user.email, role: user.role, name: user.name });

  res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

// Get User Profile
app.get('/api/auth/me', verifyUser, (req, res) => {
  const user = dbStore.getUserById((req as any).user.id);
  if (!user) {
    res.status(404).json({ error: 'User profiles could not be resolved.' });
    return;
  }

  res.json({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt
  });
});


// ================= PRODUCTS APIS =================

// Read Products with highly rich query parameters
app.get('/api/products', (req, res) => {
  let products = [...dbStore.getProducts()];
  const { q, category, minPrice, maxPrice, rating, sort } = req.query;

  // Search filter
  if (q && typeof q === 'string' && q.trim().length > 0) {
    const query = q.toLowerCase();
    products = products.filter(p =>
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.features.some(f => f.toLowerCase().includes(query))
    );

    // Save search history secretly if logged in
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        dbStore.addSearchHistory(decoded.id, q);
      }
    }
  }

  // Category filter
  if (category && typeof category === 'string' && category !== 'all') {
    products = products.filter(p => p.category === category);
  }

  // Price range filters
  if (minPrice) {
    products = products.filter(p => p.price >= parseFloat(minPrice as string));
  }
  if (maxPrice) {
    products = products.filter(p => p.price <= parseFloat(maxPrice as string));
  }

  // Rating filters
  if (rating) {
    products = products.filter(p => p.rating >= parseFloat(rating as string));
  }

  // Sort
  if (sort) {
    if (sort === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sort === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sort === 'newest') {
      products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // popular
      products.sort((a, b) => b.rating - a.rating || b.reviewsCount - a.reviewsCount);
    }
  }

  res.json(products);
});

// Return single product
app.get('/api/products/:id', (req, res) => {
  const prod = dbStore.getProductById(req.params.id);
  if (!prod) {
    res.status(404).json({ error: 'Luxury product item could not be loaded.' });
    return;
  }
  res.json(prod);
});

// Admin product insertions
app.post('/api/products', verifyAdmin, (req, res) => {
  const { name, description, price, category, images, inventory, specs, features } = req.body;
  if (!name || !price || !category) {
    res.status(400).json({ error: 'Required fields: name, price, category.' });
    return;
  }

  const product = dbStore.createProduct({
    id: 'prod_' + Math.random().toString(36).substring(2, 11),
    name,
    description: description || 'No summary registered.',
    price: parseFloat(price),
    category,
    images: images || ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800'],
    inventory: parseInt(inventory || 10),
    rating: 5.0,
    reviewsCount: 0,
    specs: specs || [],
    features: features || [],
    createdAt: new Date().toISOString()
  });

  res.status(201).json(product);
});

// Admin product edits
app.put('/api/products/:id', verifyAdmin, (req, res) => {
  const updated = dbStore.updateProduct(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Product file target does not exist.' });
    return;
  }
  res.json(updated);
});

// Admin product removals
app.delete('/api/products/:id', verifyAdmin, (req, res) => {
  const success = dbStore.deleteProduct(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Product files deletion unsuccessful.' });
    return;
  }
  res.json({ success: true, message: 'Exclusive item purged successfully.' });
});


// ================= CATEGORIES APIS =================

app.get('/api/categories', (req, res) => {
  res.json(dbStore.getCategories());
});

app.post('/api/categories', verifyAdmin, (req, res) => {
  const { name, slug, description, image } = req.body;
  if (!name || !slug) {
    res.status(400).json({ error: 'Variables name and slug are critical.' });
    return;
  }

  const category = dbStore.createCategory({
    id: 'cat_' + Math.random().toString(36).substring(2, 11),
    name,
    slug,
    description: description || '',
    image: image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600'
  });

  res.status(201).json(category);
});

app.put('/api/categories/:id', verifyAdmin, (req, res) => {
  const updated = dbStore.updateCategory(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Target Category not resolved.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/categories/:id', verifyAdmin, (req, res) => {
  const success = dbStore.deleteCategory(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Purging category unsuccessful.' });
    return;
  }
  res.json({ success: true });
});


// ================= ADDRESS APIS =================

app.get('/api/addresses', verifyUser, (req, res) => {
  res.json(dbStore.getAddresses((req as any).user.id));
});

app.post('/api/addresses', verifyUser, (req, res) => {
  const { fullName, phone, streetAddress, city, state, postalCode, country, isDefault } = req.body;
  if (!fullName || !streetAddress || !city || !postalCode || !country) {
    res.status(400).json({ error: 'Address requires essential street, state, country parameters.' });
    return;
  }

  const address = dbStore.addAddress({
    id: 'addr_' + Math.random().toString(36).substring(2, 11),
    userId: (req as any).user.id,
    fullName,
    phone: phone || '',
    streetAddress,
    city,
    state: state || '',
    postalCode,
    country,
    isDefault: !!isDefault
  });

  res.status(201).json(address);
});

app.put('/api/addresses/:id', verifyUser, (req, res) => {
  const updated = dbStore.updateAddress((req as any).user.id, req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Target address files missing.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/addresses/:id', verifyUser, (req, res) => {
  const success = dbStore.deleteAddress((req as any).user.id, req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Address deletion rejected.' });
    return;
  }
  res.json({ success: true });
});


// ================= COUPON APIS =================

// Validate coupon
app.post('/api/coupons/validate', (req, res) => {
  const { code } = req.body;
  if (!code) {
    res.status(400).json({ error: 'Coupon code is required.' });
    return;
  }

  const coupon = dbStore.getCouponByCode(code);
  if (!coupon) {
    res.status(404).json({ error: 'The promo code entered is invalid.' });
    return;
  }

  if (!coupon.active) {
    res.status(400).json({ error: 'This coupon has been deactivated.' });
    return;
  }

  if (new Date(coupon.expirationDate).getTime() < Date.now()) {
    res.status(400).json({ error: 'This high-end coupon has reached expiration.' });
    return;
  }

  if (coupon.usageCount >= coupon.usageLimit) {
    res.status(400).json({ error: 'Usage limits exceeded for this unique voucher.' });
    return;
  }

  res.json(coupon);
});

// Admin Coupon Paths
app.get('/api/coupons', verifyAdmin, (req, res) => {
  res.json(dbStore.getCoupons());
});

app.post('/api/coupons', verifyAdmin, (req, res) => {
  const { code, type, value, expirationDate, usageLimit } = req.body;
  if (!code || !type || !value) {
    res.status(400).json({ error: 'Coupon creation requires code, calculation type and valuation.' });
    return;
  }

  const coupon = dbStore.createCoupon({
    id: 'coup_' + Math.random().toString(36).substring(2, 11),
    code: code.trim().toUpperCase(),
    type,
    value: parseFloat(value),
    expirationDate: expirationDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    usageLimit: parseInt(usageLimit || 100),
    usageCount: 0,
    active: true
  });

  res.status(201).json(coupon);
});

app.put('/api/coupons/:id', verifyAdmin, (req, res) => {
  const updated = dbStore.updateCoupon(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Coupon not resolved.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/coupons/:id', verifyAdmin, (req, res) => {
  const success = dbStore.deleteCoupon(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Coupon purge failed.' });
    return;
  }
  res.json({ success: true });
});


// ================= BANNER APIS =================

app.get('/api/banners', (req, res) => {
  const activeBanners = dbStore.getBanners().filter(b => b.active);
  res.json(activeBanners);
});

app.get('/api/admin/banners', verifyAdmin, (req, res) => {
  res.json(dbStore.getBanners());
});

app.post('/api/banners', verifyAdmin, (req, res) => {
  const { title, subtitle, image, link, active, startDate, endDate } = req.body;
  if (!title || !image) {
    res.status(400).json({ error: 'Banners strictly require high-contrast photographic image and titles.' });
    return;
  }

  const banner = dbStore.createBanner({
    id: 'ban_' + Math.random().toString(36).substring(2, 11),
    title,
    subtitle: subtitle || '',
    image,
    link: link || '/shop',
    active: active !== undefined ? !active : true,
    startDate: startDate || new Date().toISOString().substring(0, 10),
    endDate: endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10)
  });

  res.status(201).json(banner);
});

app.put('/api/banners/:id', verifyAdmin, (req, res) => {
  const updated = dbStore.updateBanner(req.params.id, req.body);
  if (!updated) {
    res.status(404).json({ error: 'Banner could not be modified.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/banners/:id', verifyAdmin, (req, res) => {
  const success = dbStore.deleteBanner(req.params.id);
  if (!success) {
    res.status(404).json({ error: 'Purging banner failed.' });
    return;
  }
  res.json({ success: true });
});


// ================= ORDERING & TRACKING APIS =================

app.get('/api/orders', verifyUser, (req, res) => {
  const u = (req as any).user;
  if (u.role === UserRole.ADMIN) {
    res.json(dbStore.getOrders());
  } else {
    res.json(dbStore.getOrdersByUserId(u.id));
  }
});

app.post('/api/orders', verifyUser, (req, res) => {
  const { items, subtotal, tax, shippingCost, discount, total, couponCode, shippingAddress, paymentMethod } = req.body;
  
  if (!items || !items.length || !shippingAddress) {
    res.status(400).json({ error: 'Empty checkouts are forbidden.' });
    return;
  }

  // Validate inventory
  for (const item of items) {
    const freshProd = dbStore.getProductById(item.product.id);
    if (!freshProd) {
      res.status(404).json({ error: `Product ${item.product.name} is no longer available.` });
      return;
    }
    if (freshProd.inventory < item.quantity) {
      res.status(400).json({ error: `Not enough stock for ${freshProd.name} (Only ${freshProd.inventory} remaining).` });
      return;
    }
  }

  // Generate tracking schedule
  const deliveryDays = 3;
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + deliveryDays);

  const order = dbStore.createOrder({
    id: 'LX_' + Math.random().toString(36).substring(2, 8).toUpperCase(),
    userId: (req as any).user.id,
    items,
    subtotal: parseFloat(subtotal),
    tax: parseFloat(tax),
    shippingCost: parseFloat(shippingCost),
    discount: parseFloat(discount || 0),
    total: parseFloat(total),
    couponCode,
    shippingAddress,
    paymentMethod: paymentMethod || 'Premium Credit Card',
    paymentStatus: 'paid', // Simulate pre-validated transaction
    trackingStatus: 'placed',
    estimatedDelivery: deliveryDate.toISOString(),
    createdAt: new Date().toISOString()
  });

  // Increment usage constraint if coupon used
  if (couponCode) {
    const coupon = dbStore.getCouponByCode(couponCode);
    if (coupon) {
      coupon.usageCount += 1;
    }
  }

  res.status(201).json(order);
});

app.get('/api/orders/:id', verifyUser, (req, res) => {
  const order = dbStore.getOrderById(req.params.id);
  if (!order) {
    res.status(404).json({ error: 'Order profile could not be logged.' });
    return;
  }

  // Customers can only see their own orders, Admins can inspect anything
  const u = (req as any).user;
  if (u.role !== UserRole.ADMIN && order.userId !== u.id) {
    res.status(403).json({ error: 'Access forbidden. Order does not belong to your address.' });
    return;
  }

  res.json(order);
});

app.put('/api/orders/:id/status', verifyAdmin, (req, res) => {
  const { status } = req.body;
  if (!status) {
    res.status(400).json({ error: 'Tracking status code is required.' });
    return;
  }

  const updated = dbStore.updateOrderStatus(req.params.id, status as TrackingStatus);
  if (!updated) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  res.json(updated);
});


// ================= REVIEWS APIS =================

app.get('/api/reviews/:productId', (req, res) => {
  res.json(dbStore.getReviewsByProduct(req.params.productId));
});

app.post('/api/reviews', verifyUser, (req, res) => {
  const { productId, rating, comment } = req.body;
  if (!productId || !rating || !comment) {
    res.status(400).json({ error: 'Review card requires score (rating) and narrative.' });
    return;
  }

  const review = dbStore.addReview({
    id: 'rev_' + Math.random().toString(36).substring(2, 11),
    productId,
    userId: (req as any).user.id,
    userName: (req as any).user.name || 'Anonymous Collector',
    rating: parseInt(rating),
    comment,
    createdAt: new Date().toISOString()
  });

  res.status(201).json(review);
});


// ================= WISHLIST APIS =================

app.get('/api/wishlist', verifyUser, (req, res) => {
  const items = dbStore.getWishlist((req as any).user.id);
  // Expand products
  const products = items.map(it => dbStore.getProductById(it.productId)).filter(Boolean);
  res.json(products);
});

app.post('/api/wishlist', verifyUser, (req, res) => {
  const { productId } = req.body;
  if (!productId) {
    res.status(400).json({ error: 'Product SKU code required.' });
    return;
  }

  const item = dbStore.addToWishlist((req as any).user.id, productId);
  if (!item) {
    res.status(400).json({ error: 'Item has already been logged in your wishlist.' });
    return;
  }

  res.status(201).json(item);
});

app.delete('/api/wishlist/:productId', verifyUser, (req, res) => {
  const success = dbStore.removeFromWishlist((req as any).user.id, req.params.productId);
  if (!success) {
    res.status(404).json({ error: 'Item not located in your saved gallery.' });
    return;
  }
  res.json({ success: true });
});


// ================= SEARCH HISTORY APIS =================

app.get('/api/search/history', verifyUser, (req, res) => {
  res.json(dbStore.getSearchHistory((req as any).user.id));
});

app.delete('/api/search/history', verifyUser, (req, res) => {
  dbStore.clearSearchHistory((req as any).user.id);
  res.json({ success: true });
});


// ================= INTEGRATED ANALYTICS INTERFACE =================

app.get('/api/analytics', verifyAdmin, (req, res) => {
  res.json(dbStore.getAnalytics());
});


// ================= SIMULATED FILE UP-LOADER (Mock Cloudinary Service) =================

app.post('/api/upload', verifyAdmin, (req, res) => {
  const { fileData } = req.body;
  // If base64, save in local memory, or return beautiful public asset link
  // Generate random preview link
  const mockImages = [
    'https://images.unsplash.com/photo-1547996160-81dfa63595aa?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&q=80&w=800',
    'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=800'
  ];
  const url = mockImages[Math.floor(Math.random() * mockImages.length)];
  res.json({ url, secure_url: url, message: 'Cloudinary simulated delivery success.' });
});


// ================= VITE OR STATIC BUILD MIDDLEWARE ENVIRONMENT =================

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LUXORA Server] Elite portal fully functional at port ${PORT}`);
  });
}

startServer().catch(err => {
  console.error('[LUXORA Server] Failed to initialize express container:', err);
});
