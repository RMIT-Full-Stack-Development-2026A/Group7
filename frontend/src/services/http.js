/**
 * REST HTTP Helper
 * Returns { data, status, headers } for every request.
 * Reads JWT from localStorage automatically.
 */

function getToken() {
  return localStorage.getItem('token');
}

async function request(method, url, { body, headers: extraHeaders = {}, isFormData = false } = {}) {
  const token = getToken();
  const headers = { ...extraHeaders };

  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
  });

  const responseHeaders = res.headers;
  let data;
  const ct = res.headers.get('content-type') || '';
  try {
    data = ct.includes('application/json') ? await res.json() : await res.text();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      data?.error ||
      (Array.isArray(data?.errors) ? data.errors.map((e) => e.msg).join(', ') : null) ||
      `HTTP ${res.status}`;
    throw Object.assign(new Error(message), { status: res.status, data });
  }

  return { data, status: res.status, headers: responseHeaders };
}

const http = {
  get:    (url, opts)  => request('GET',    url, opts),
  post:   (url, body, opts) => request('POST',  url, { body, ...opts }),
  put:    (url, body, opts) => request('PUT',   url, { body, ...opts }),
  patch:  (url, body, opts) => request('PATCH', url, { body, ...opts }),
  delete: (url, opts)  => request('DELETE', url, opts),
};

export default http;
