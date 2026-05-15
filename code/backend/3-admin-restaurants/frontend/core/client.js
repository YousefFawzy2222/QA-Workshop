const API_BASE = 'http://localhost:3000/api';

const apiClient = {
  getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const email = localStorage.getItem('userEmail');
    if (email) headers['x-user-email'] = email;
    return headers;
  },

  async request(endpoint, options = {}) {
    try {
      const res = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers: { ...this.getHeaders(), ...options.headers }
      });
      const data = await res.json();
      return { status: res.status, ok: res.ok, data };
    } catch (err) {
      console.error('API Error:', err);
      return { ok: false, data: { success: false, error: 'Network error' } };
    }
  },

  get(endpoint) { return this.request(endpoint); },
  post(endpoint, body) { return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) }); },
  put(endpoint, body) { return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) }); },
  patch(endpoint, body) { return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) }); },
  delete(endpoint) { return this.request(endpoint, { method: 'DELETE' }); }
};
