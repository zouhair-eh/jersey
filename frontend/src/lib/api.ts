/**
 * @file api.ts
 * @description Centralized API client for jersey_marocco frontend.
 *              Wraps fetch with auth token management.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// ── Token Management ─────────────────────────────────────────────────────────

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('jm_token');
}

export function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('jm_token', token);
  }
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('jm_token');
    localStorage.removeItem('jm_user');
  }
}

// ── Base Fetch ───────────────────────────────────────────────────────────────

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong');
  }

  return data;
}

// ── Auth API ─────────────────────────────────────────────────────────────────

export interface AuthResponse {
  success: boolean;
  token: string;
  data: {
    _id: string;
    name: string;
    email: string;
    roles: string[];
    avatar: string;
  };
}

export async function apiLogin(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setToken(res.token);
  if (typeof window !== 'undefined') {
    localStorage.setItem('jm_user', JSON.stringify(res.data));
  }
  return res;
}

export async function apiRegister(
  name: string,
  email: string,
  password: string,
  roles: string[] = ['client']
): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, roles }),
  });
  setToken(res.token);
  if (typeof window !== 'undefined') {
    localStorage.setItem('jm_user', JSON.stringify(res.data));
  }
  return res;
}

export async function apiLogout(): Promise<void> {
  try {
    await apiFetch('/auth/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export async function apiGetMe(): Promise<{ success: boolean; data: AuthResponse['data'] }> {
  return apiFetch('/auth/me');
}

// ── Product API ──────────────────────────────────────────────────────────────

export interface ApiProduct {
  _id: string;
  title: { ar: string; fr: string; en: string };
  description: { ar: string; fr: string; en: string };
  price: { amount: number; currency: string };
  images: { url: string; altText?: string; _id?: string }[];
  sizes: { label: string; stock: number }[];
  category: string;
  tags: string[];
  averageRating: number;
  totalReviews: number;
  isPublished: boolean;
  owner_id?: { _id: string; name: string; avatar?: string };
  createdAt: string;
}

interface ProductsResponse {
  success: boolean;
  count: number;
  total: number;
  page: number;
  pages: number;
  data: ApiProduct[];
}

export async function apiGetProducts(params?: Record<string, string>): Promise<ProductsResponse> {
  const query = params ? '?' + new URLSearchParams(params).toString() : '';
  return apiFetch(`/products${query}`);
}

export async function apiGetProduct(id: string): Promise<{ success: boolean; data: ApiProduct }> {
  return apiFetch(`/products/${id}`);
}

// ── Review API ───────────────────────────────────────────────────────────────

export interface ApiReview {
  _id: string;
  author_id: { _id: string; name: string; avatar?: string };
  product_id: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export async function apiGetReviews(productId: string): Promise<{ success: boolean; count: number; data: ApiReview[] }> {
  return apiFetch(`/products/${productId}/reviews`);
}

export async function apiCreateReview(
  productId: string,
  rating: number,
  comment: string
): Promise<{ success: boolean; data: ApiReview }> {
  return apiFetch(`/products/${productId}/reviews`, {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
}
