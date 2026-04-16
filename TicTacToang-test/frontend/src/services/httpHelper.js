const request = async (url, method = 'GET', body = null, headers = {}) => {
  const token = localStorage.getItem('token')
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  }
  if (body) options.body = JSON.stringify(body)

  const response = await fetch(url, options)
  const data = await response.json().catch(() => ({}))
  return { data, status: response.status, ok: response.ok }
}

export const httpHelper = {
  get:    (url, h)       => request(url, 'GET',    null, h),
  post:   (url, body, h) => request(url, 'POST',   body, h),
  put:    (url, body, h) => request(url, 'PUT',    body, h),
  patch:  (url, body, h) => request(url, 'PATCH',  body, h),
  delete: (url, h)       => request(url, 'DELETE', null, h),
}