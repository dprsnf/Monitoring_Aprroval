import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import type { AxiosError, AxiosRequestConfig } from "axios";
import api from "@/lib/axios";
import { Division, User } from "@/app/types";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

interface JwtPayload extends User {
  iat: number;
  exp: number;
}

interface LoginPayload {
  email: string;
  password: string;
}

type RetriableAxiosRequestConfig = AxiosRequestConfig & { _retry?: boolean };

type RefreshQueueItem = (token: string | null, error?: unknown) => void;

let isInterceptorAttached = false;
let isRefreshing = false;
let refreshQueue: RefreshQueueItem[] = [];

const isBrowser = () => typeof window !== "undefined";

const getAccessToken = () => (isBrowser() ? Cookies.get(ACCESS_TOKEN_KEY) : undefined);
const getRefreshToken = () => (isBrowser() ? Cookies.get(REFRESH_TOKEN_KEY) : undefined);

const saveTokens = (accessToken: string, refreshToken?: string) => {
  Cookies.set(ACCESS_TOKEN_KEY, accessToken, { expires: 1, secure: true });
  if (refreshToken) {
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { expires: 7, secure: true });
  }
};

const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_KEY);
};

const decodeUser = (accessToken: string): JwtPayload => jwtDecode<JwtPayload>(accessToken);
const isExpired = (token: string) => {
  try {
    const { exp } = jwtDecode<JwtPayload>(token);
    return exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

const getActiveSession = async (): Promise<{ token: string; user: JwtPayload } | null> => {
  if (!isBrowser()) return null;

  let accessToken = getAccessToken();

  if (!accessToken) return null;

  if (isExpired(accessToken)) {
    try {
      const refreshed = await refreshTokens();
      accessToken = refreshed.accessToken;
    } catch {
      clearTokens();
      return null;
    }
  }

  if (!accessToken) {
    throw new Error("Access token is undefined.");
  }
  const decoded = decodeUser(accessToken);
  return { token: accessToken, user: decoded };
};

export const loginAsRole = async (role: Division, payload: LoginPayload) => {
  const { data } = await api.post("/auth/login", payload);
  const { accessToken, refreshToken } = data;

  const decoded = decodeUser(accessToken);
  if (decoded.division !== role) {
    clearTokens();
    throw new Error("Role tidak sesuai dengan kredensial yang digunakan.");
  }

  saveTokens(accessToken, refreshToken);

  return { accessToken, refreshToken, user: decoded };
};

export const loginAsManager = (payload: LoginPayload) => loginAsRole(Division.Manager, payload);
export const loginAsDalkon = (payload: LoginPayload) => loginAsRole(Division.Dalkon, payload);
export const loginAsEngineer = (payload: LoginPayload) => loginAsRole(Division.Engineer, payload);
export const loginAsVendor = (payload: LoginPayload) => loginAsRole(Division.Vendor, payload);

export const refreshTokens = async () => {
  if (!isBrowser()) {
    throw new Error("Refresh token hanya tersedia di browser.");
  }
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error("Refresh token tidak ditemukan.");
  }

  const { data } = await api.post("/auth/refresh", { refreshToken });
  const { accessToken, refreshToken: newRefreshToken } = data;
  const effectiveRefreshToken = newRefreshToken ?? refreshToken;

  saveTokens(accessToken, effectiveRefreshToken);

  return { accessToken, refreshToken: effectiveRefreshToken };
};

type MiddlewareOptions = {
  allowedRoles?: Division[];
  onUnauthorizedRedirect?: string;
  onForbiddenRedirect?: string;
};

export const ensureAuthMiddleware = async (options: MiddlewareOptions = {}) => {
  const { allowedRoles, onUnauthorizedRedirect = "/auth/login", onForbiddenRedirect = "/" } = options;

  if (!isBrowser()) return null;

  const session = await getActiveSession();

  if (!session) {
    window.location.href = onUnauthorizedRedirect;
    return null;
  }

  const { token: accessToken, user: decoded } = session;

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(decoded.division)) {
    window.location.href = onForbiddenRedirect;
    return null;
  }

  return { token: accessToken, user: decoded };
};

type GuestMiddlewareOptions = {
  redirectTo?: string;
};

export const ensureGuestMiddleware = async (options: GuestMiddlewareOptions = {}) => {
  const { redirectTo = "/dashboard" } = options;

  if (!isBrowser()) return null;

  const session = await getActiveSession();

  if (session) {
    window.location.href = redirectTo;
    return session;
  }

  return null;
};

const flushQueue = (token: string | null, error?: unknown) => {
  refreshQueue.forEach((callback) => callback(token, error));
  refreshQueue = [];
};

export const initAuthProxy = () => {
  if (isInterceptorAttached) return;

  api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const originalRequest = error.config as RetriableAxiosRequestConfig;
      const status = error.response?.status;

      if (status === 401 && !originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshQueue.push((token, queueError) => {
              if (queueError || !token) {
                reject(queueError || error);
                return;
              }

              originalRequest._retry = true;
              originalRequest.headers = {
                ...(originalRequest.headers || {}),
                Authorization: `Bearer ${token}`,
              };

              resolve(api(originalRequest));
            });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { accessToken } = await refreshTokens();
          flushQueue(accessToken, undefined);

          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${accessToken}`,
          };

          return api(originalRequest);
        } catch (refreshError) {
          flushQueue(null, refreshError);
          clearTokens();
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      return Promise.reject(error);
    }
  );

  isInterceptorAttached = true;
};

export const logoutProxy = () => {
  clearTokens();
};
