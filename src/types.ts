/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user'
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
}

export interface Address {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  streetAddress: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

export interface ProductSpec {
  name: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  inventory: number;
  rating: number;
  reviewsCount: number;
  specs: ProductSpec[];
  features: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
}

export type TrackingStatus = 'placed' | 'processing' | 'packed' | 'shipped' | 'delivery' | 'delivered';

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  total: number;
  couponCode?: string;
  shippingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  trackingStatus: TrackingStatus;
  estimatedDelivery: string;
  createdAt: string;
}

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  expirationDate: string;
  usageLimit: number;
  usageCount: number;
  active: boolean;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  link: string;
  active: boolean;
  startDate: string;
  endDate: string;
}

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  ordersCount: number;
  customersCount: number;
  productsCount: number;
  revenueTrend: { date: string; amount: number }[];
  salesTrend: { date: string; count: number }[];
  categoryPerformance: { category: string; value: number }[];
  topProducts: { name: string; sales: number; revenue: number }[];
  conversionRate: number;
  monthlyGrowth: number;
}
