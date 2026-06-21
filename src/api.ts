/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Central API handler for all LUXORA (by VV Mart) endpoint interfaces
const getAuthToken = () => localStorage.getItem('luxora_token');

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(path, { ...options, headers });
  
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Server returned error status code: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export const api = {
  // Authentication
  auth: {
    login: (credentials: any) => request<any>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),
    register: (details: any) => request<any>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(details)
    }),
    me: () => request<any>('/api/auth/me')
  },

  // Products & Discover filter
  products: {
    list: (params: { q?: string; category?: string; minPrice?: number; maxPrice?: number; rating?: number; sort?: string } = {}) => {
      const qParams = new URLSearchParams();
      if (params.q) qParams.set('q', params.q);
      if (params.category) qParams.set('category', params.category);
      if (params.minPrice) qParams.set('minPrice', params.minPrice.toString());
      if (params.maxPrice) qParams.set('maxPrice', params.maxPrice.toString());
      if (params.rating) qParams.set('rating', params.rating.toString());
      if (params.sort) qParams.set('sort', params.sort);
      
      return request<any[]>(`/api/products?${qParams.toString()}`);
    },
    get: (id: string) => request<any>(`/api/products/${id}`),
    create: (data: any) => request<any>('/api/products', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => request<any>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id: string) => request<any>(`/api/products/${id}`, {
      method: 'DELETE'
    })
  },

  // Categories
  categories: {
    list: () => request<any[]>('/api/categories'),
    create: (data: any) => request<any>('/api/categories', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => request<any>(`/api/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id: string) => request<any>(`/api/categories/${id}`, {
      method: 'DELETE'
    })
  },

  // Addresses
  addresses: {
    list: () => request<any[]>('/api/addresses'),
    create: (data: any) => request<any>('/api/addresses', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => request<any>(`/api/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id: string) => request<any>(`/api/addresses/${id}`, {
      method: 'DELETE'
    })
  },

  // Coupons
  coupons: {
    validate: (code: string) => request<any>('/api/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ code })
    }),
    list: () => request<any[]>('/api/coupons'),
    create: (data: any) => request<any>('/api/coupons', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => request<any>(`/api/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id: string) => request<any>(`/api/coupons/${id}`, {
      method: 'DELETE'
    })
  },

  // Banners
  banners: {
    list: () => request<any[]>('/api/banners'),
    adminList: () => request<any[]>('/api/admin/banners'),
    create: (data: any) => request<any>('/api/banners', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    update: (id: string, data: any) => request<any>(`/api/banners/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),
    delete: (id: string) => request<any>(`/api/banners/${id}`, {
      method: 'DELETE'
    })
  },

  // Orders
  orders: {
    list: () => request<any[]>('/api/orders'),
    create: (data: any) => request<any>('/api/orders', {
      method: 'POST',
      body: JSON.stringify(data)
    }),
    get: (id: string) => request<any>(`/api/orders/${id}`),
    updateStatus: (id: string, status: string) => request<any>(`/api/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    })
  },

  // Reviews
  reviews: {
    byProduct: (productId: string) => request<any[]>(`/api/reviews/${productId}`),
    create: (data: any) => request<any>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  },

  // Wishlist
  wishlist: {
    list: () => request<any[]>('/api/wishlist'),
    add: (productId: string) => request<any>('/api/wishlist', {
      method: 'POST',
      body: JSON.stringify({ productId })
    }),
    delete: (productId: string) => request<any>(`/api/wishlist/${productId}`, {
      method: 'DELETE'
    })
  },

  // Search History
  searchHistory: {
    list: () => request<string[]>('/api/search/history'),
    clear: () => request<any>('/api/search/history', {
      method: 'DELETE'
    })
  },

  // Analytics
  analytics: {
    get: () => request<any>('/api/analytics')
  },

  // Simulated base64 image upload
  upload: (fileData: string) => request<any>('/api/upload', {
    method: 'POST',
    body: JSON.stringify({ fileData })
  })
};
