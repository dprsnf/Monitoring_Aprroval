import axios from "axios";

const getCookieValue = (name: string): string | null => {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split("=").map((c) => c.trim());
    if (cookieName === name) {
      return cookieValue;
    }
  }
  return null;
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  timeout: 180000, // 180 seconds (3 minutes) for large file downloads and annotation processing
  // headers: {
  //   // "Content-Type": "application/json",
  // },
});

// Add a request interceptor to include the access token
api.interceptors.request.use(
  (config) => {
    // 1. Kalau di browser → ambil dari cookie seperti biasa
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split(";").reduce((acc, c) => {
        const [key, val] = c.trim().split("=");
        acc[key] = val;
        return acc;
      }, {} as Record<string, string>);

      const token = cookies["access_token"];
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Kalau di server → token akan di-inject manual dari cookies() di page.tsx
    //    (lihat kode page.tsx di bawah)

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;