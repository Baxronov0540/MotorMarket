/**
 * MotorMarket — API client
 * Wraps the FastAPI backend (see /app routers) with fetch calls.
 * Change BASE_URL to point at your running backend.
 */
const BASE_URL = window.MOTORMARKET_API_URL || "http://127.0.0.1:8000";

const TOKEN_KEY = "mm_access_token";
const REFRESH_KEY = "mm_refresh_token";

const Auth = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  getRefresh: () => localStorage.getItem(REFRESH_KEY),
  setTokens: (access, refresh) => {
    if (access) localStorage.setItem(TOKEN_KEY, access);
    if (refresh) localStorage.setItem(REFRESH_KEY, refresh);
  },
  clear: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
  isLoggedIn: () => !!localStorage.getItem(TOKEN_KEY),
};

function getAuthUser() {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return { id: payload.user_id };
  } catch {
    return null;
  }
}

/**
 * Core request helper. Throws an Error with a human-readable .message
 * on any non-2xx response, pulling FastAPI's {detail: "..."} where possible.
 */
async function request(path, { method = "GET", body, isForm = false, auth = false } = {}) {
  const headers = {};
  if (!isForm && body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = Auth.getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
    });
  } catch (err) {
    throw new Error(`Serverga ulanib bo'lmadi. Asl xato: ${err.message}`);
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = text; }
  }

  if (!res.ok) {
    if (res.status === 401 && !path.includes("/user/login") && !path.includes("/user/register")) {
      Auth.clear();
      window.location.href = "auth.html";
    }
    const detail = (data && data.detail) ? data.detail : `Xatolik (${res.status})`;
    const err = new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
    err.status = res.status;
    throw err;
  }

  return data;
}

const API = {
  // ---- Category ----
  categories: {
    list: () => request("/category/catgory"),
    get: (id) => request(`/category/category/${id}`),
  },

  // ---- Listing ----
  listings: {
    list: () => request("/listing/list"),
    get: (id) => request(`/listing/get/${id}`),
    filter: (params = {}) => {
      const q = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") q.set(k, v);
      });
      return request(`/listing/filter/?${q.toString()}`);
    },
    mine: () => request("/listing/user/", { auth: true }),
    create: (payload) => request("/listing/create", { method: "POST", body: payload, auth: true }),
    update: (id, payload) => request(`/listing/update/${id}`, { method: "PUT", body: payload, auth: true }),
    remove: (id) => request(`/listing/delete/${id}`, { method: "DELETE", auth: true }),
    makeVip: (id) => request(`/listing/${id}/vip`, { method: "POST", auth: true }),
    uploadMedia: (file, { listingId, sortOrder = 0, isCover = false }) => {
      const fd = new FormData();
      fd.append("file", file);
      const q = new URLSearchParams({
        listing_id: listingId,
        sort_order: sortOrder,
        is_cover: isCover,
      });
      return request(`/listing/media?${q.toString()}`, { method: "POST", body: fd, isForm: true, auth: true });
    },
    count: (categoryId) => request(`/listing/count/${categoryId ?? ""}`, { auth: true }),
  },

  // ---- Saved listings ----
  saved: {
    list: () => request("/saved/list", { auth: true }),
    create: (listingId) => request("/saved/create", { method: "POST", body: { listing_id: listingId }, auth: true }),
  },

  // ---- Chat ----
  chat: {
    list: () => request("/conversation/list", { auth: true }),
    create: (payload) => request("/conversation/create", { method: "POST", body: payload, auth: true }),
    getDetails: (id) => request(`/conversation/${id}`, { auth: true }),
    sendMessage: (id, payload) => request(`/conversation/${id}/message`, { method: "POST", body: payload, auth: true }),
    getMessages: (id, page = 1) => request(`/conversation/${id}/messages?page=${page}`, { auth: true })
  },

  // ---- User / auth ----
  user: {
    register: (email, password) => request("/user/register", { method: "POST", body: { email, password } }),
    confirm: (code) => request(`/user/confirm/${code}`, { method: "POST" }),
    login: (email, password) => request("/user/login", { method: "POST", body: { email, password } }),
    refresh: (refresh_token) => request(`/user/refresh?refresh_token=${encodeURIComponent(refresh_token)}`, { method: "POST" }),
    profile: () => request("/user/profile", { auth: true }),
    // NOTE: backend route decorators for these two are missing a leading "/"
    // (`@router.put("profile/update")` / `@router.put("change/password")`),
    // which makes FastAPI fail to mount them as-is. Fix them to
    // `@router.put("/profile/update")` and `@router.put("/change/password")`
    // in app/routers/user.py for these calls to work.
    updateProfile: (payload) => request("/user/profile/update", { method: "PUT", body: payload, auth: true }),
    changePassword: (password) => request(`/user/change/password?password=${encodeURIComponent(password)}`, { method: "PUT", auth: true }),
  },
};

async function login(email, password) {
  const tokens = await API.user.login(email, password);
  Auth.setTokens(tokens.access_token, tokens.refresh_token);
  return tokens;
}

function logout() {
  Auth.clear();
  window.location.href = "index.html";
}

function mediaUrl(url) {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url}`;
}
