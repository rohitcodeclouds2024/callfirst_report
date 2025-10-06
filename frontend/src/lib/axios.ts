// src/lib/axios.ts
import axios, { AxiosInstance } from 'axios';
import Router from 'next/router';

const BASE = process.env.NEXT_PUBLIC_ADMIN_BASE_URL || '';

/**
 * Single shared Axios instance for the frontend.
 * We don't attach auth here automatically because we don't have access to hooks.
 * Instead use `setAuthToken()` or the `useApi()` hook below.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  // You may set other defaults here (timeout, withCredentials, etc.)
});

/**
 * Attach a bearer token to the API client defaults.
 * Pass `null` to remove the auth header.
 */
export function setAuthToken(token: string | null) {
  if (token) {
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common['Authorization'];
  }
}

/**
 * Optional: A simple 401 interceptor that redirects to login.
 * If you prefer to handle 401s in individual calls, don't call enableAutoAuthHandler().
 */
export function enableAutoAuthHandler(onUnauthorized?: () => void) {
  apiClient.interceptors.response.use(
    (r) => r,
    (error) => {
      const status = error?.response?.status;
      if (status === 401) {
        // clear token and optionally redirect to login page
        setAuthToken(null);
        if (onUnauthorized) onUnauthorized();
        else Router.push('/login');
      }
      return Promise.reject(error);
    }
  );
}
